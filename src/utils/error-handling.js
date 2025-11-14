const { SecurityLogger } = require('../security/audit');

class ApiError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ValidationError extends ApiError {
  constructor(message) {
    super(message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

const ErrorType = {
  BUSINESS: 'BUSINESS',
  SYSTEM: 'SYSTEM',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE'
};

class ErrorHandler {
  static categorizeError(error) {
    if (error instanceof ValidationError) return ErrorType.VALIDATION;
    if (error instanceof AuthenticationError) return ErrorType.AUTHENTICATION;
    if (error instanceof AuthorizationError) return ErrorType.AUTHORIZATION;
    if (error instanceof ApiError) return ErrorType.BUSINESS;
    
    if (error.message.includes('Network Error') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    
    if (error.message.includes('API') || error.message.includes('service')) {
      return ErrorType.EXTERNAL_SERVICE;
    }
    
    return ErrorType.SYSTEM;
  }
  
  static logError(error, context, metadata = {}) {
    const errorType = this.categorizeError(error);
    
    const logData = {
      type: errorType,
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      ...metadata
    };
    
    SecurityLogger.error('Application Error', logData);
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error Details:', logData);
    }
  }
  
  static getUserErrorMessage(error) {
    if (error instanceof ValidationError) {
      return 'Invalid input provided. Please check your data and try again.';
    }
    
    if (error instanceof AuthenticationError) {
      return 'Please log in to access this feature.';
    }
    
    if (error instanceof AuthorizationError) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error instanceof NotFoundError) {
      return 'The requested resource could not be found.';
    }
    
    if (error instanceof RateLimitError) {
      return 'Too many requests. Please try again later.';
    }
    
    if (error.message.includes('Network Error') || 
        error.message.includes('Failed to fetch')) {
      return 'Network connection issue. Please check your connection and try again.';
    }
    
    return 'An unexpected error occurred. Please try again or contact support.';
  }
  
  static sanitizeError(error) {
    if (process.env.NODE_ENV === 'production') {
      return {
        message: this.getUserErrorMessage(error)
      };
    }
    
    return {
      message: error.message,
      type: error.name
    };
  }
  
  static async handleAsyncError(operation, errorContext = 'Operation') {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      this.logError(error, errorContext);
      return { 
        success: false, 
        error: this.getUserErrorMessage(error) 
      };
    }
  }
}

const httpErrorHandler = (err, req, res, next) => {
  ErrorHandler.logError(err, `HTTP Request: ${req.method} ${req.path}`, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    params: req.params,
    query: req.query,
    body: req.body
  });

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: ErrorHandler.sanitizeError(err),
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(500).json({
    error: ErrorHandler.sanitizeError(err),
    timestamp: new Date().toISOString()
  });
};

class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  static error(error, statusCode) {
    const sanitizedError = ErrorHandler.sanitizeError(error);
    const status = statusCode || (error instanceof ApiError ? error.statusCode : 500);
    
    return {
      success: false,
      error: sanitizedError.message,
      ...(sanitizedError.type && { type: sanitizedError.type }),
      timestamp: new Date().toISOString(),
      statusCode: status
    };
  }
}

const asyncHandler = (fn) => (
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.logError(error, 'Async Handler');
      
      if (args.length >= 3) {
        const [, res] = args;
        if (res && typeof res.status === 'function') {
          res.status(500).json(ApiResponse.error(error));
          return;
        }
      }
      
      throw error;
    }
  }
);

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ErrorType,
  ErrorHandler,
  httpErrorHandler,
  ApiResponse,
  asyncHandler
};
