/**
 * Centralized error handling for Genaro DFT 2.0 platform
 * Implements proper error boundaries, logging, and user-friendly error messages
 */

import { SecurityLogger } from '../security/audit';

// Custom error types for the application
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Set the prototype explicitly to fix instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// Error classification
export enum ErrorType {
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE'
}

// Error handling utility
export class ErrorHandler {
  // Categorize error based on type
  static categorizeError(error: Error): ErrorType {
    if (error instanceof ValidationError) return ErrorType.VALIDATION;
    if (error instanceof AuthenticationError) return ErrorType.AUTHENTICATION;
    if (error instanceof AuthorizationError) return ErrorType.AUTHORIZATION;
    if (error instanceof ApiError) return ErrorType.BUSINESS;
    
    // Network errors
    if (error.message.includes('Network Error') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    
    // Check if it's an external service error (like API call)
    if (error.message.includes('API') || error.message.includes('service')) {
      return ErrorType.EXTERNAL_SERVICE;
    }
    
    // Default to system error for unknown errors
    return ErrorType.SYSTEM;
  }
  
  // Log error with security considerations
  static logError(error: Error, context?: string, metadata?: Record<string, any>): void {
    const errorType = this.categorizeError(error);
    
    const logData = {
      type: errorType,
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      ...metadata
    };
    
    // Log to security logger for audit trail
    SecurityLogger.error('Application Error', logData);
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error Details:', logData);
    }
  }
  
  // Generate user-friendly error messages
  static getUserErrorMessage(error: Error): string {
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
    
    // Handle network errors
    if (error.message.includes('Network Error') || 
        error.message.includes('Failed to fetch')) {
      return 'Network connection issue. Please check your connection and try again.';
    }
    
    // Default message for system errors
    return 'An unexpected error occurred. Please try again or contact support.';
  }
  
  // Sanitize error for client exposure
  static sanitizeError(error: Error): { message: string; type?: string } {
    // Don't expose internal error details to clients in production
    if (process.env.NODE_ENV === 'production') {
      return {
        message: this.getUserErrorMessage(error)
      };
    }
    
    // In development, include more details
    return {
      message: error.message,
      type: error.name
    };
  }
  
  // Handle error in async operations
  static async handleAsyncError<T>(
    operation: () => Promise<T>,
    errorContext: string = 'Operation'
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      this.logError(error as Error, errorContext);
      return { 
        success: false, 
        error: this.getUserErrorMessage(error as Error) 
      };
    }
  }
}

// HTTP error handler middleware (for Express/Node.js)
export const httpErrorHandler = (
  err: Error,
  req: any,
  res: any,
  next: any
): void => {
  ErrorHandler.logError(err, `HTTP Request: ${req.method} ${req.path}`, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    params: req.params,
    query: req.query,
    body: req.body
  });

  // If headers already sent, delegate to default error handler
  if (res.headersSent) {
    return next(err);
  }

  // Check if it's a known error type
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: ErrorHandler.sanitizeError(err),
      timestamp: new Date().toISOString()
    });
    return;
  }

  // For other errors, return 500
  res.status(500).json({
    error: ErrorHandler.sanitizeError(err),
    timestamp: new Date().toISOString()
  });
};

// API response handler with error handling
export class ApiResponse {
  static success<T>(data: T, message: string = 'Success', statusCode: number = 200) {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  static error(error: Error, statusCode?: number) {
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

// Async handler wrapper to prevent unhandled promise rejections
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(
  fn: T
) => (
  async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.logError(error as Error, 'Async Handler');
      
      // If this is an Express handler, try to send an error response
      if (args.length >= 3) {
        const [, res] = args as [any, any, any];
        if (res && typeof res.status === 'function') {
          res.status(500).json(ApiResponse.error(error as Error));
          return;
        }
      }
      
      // Otherwise, re-throw for outer handling
      throw error;
    }
  }
);
