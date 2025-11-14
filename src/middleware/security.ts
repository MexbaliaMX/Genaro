/**
 * Security middleware for Genaro DFT 2.0 API
 * Implements various security checks and protections
 */

import { Request, Response, NextFunction } from 'express';
import type { CorsOptions } from 'cors';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import { SecurityLogger, isValidOrigin, validateContent, securityHeaders, RateLimiter } from '../security/audit';
import { ApiError, ValidationError, RateLimitError } from '../utils/error-handling';

const createRateLimitMiddleware = (windowMs: number, max: number) => {
  const limiter = new RateLimiter(windowMs, max);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.get('x-forwarded-for') || 'unknown';
    const result = limiter.isAllowed(identifier);
    
    if (!result.allowed) {
      throw new RateLimitError(result.message);
    }
    
    res.setHeader('RateLimit-Policy', `${max};w=${windowMs / 1000}`);
    if (result.resetTime) {
      const secondsUntilReset = Math.max(0, Math.ceil((result.resetTime - Date.now()) / 1000));
      res.setHeader('RateLimit-Reset', secondsUntilReset.toString());
    }
    
    next();
  };
};

// Rate limiting configuration
export const apiLimiter = createRateLimitMiddleware(15 * 60 * 1000, 100);

// Special limiter for auth endpoints
export const authLimiter = createRateLimitMiddleware(15 * 60 * 1000, 5);

const DEFAULT_CSP = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: http:",
  "script-src 'self'",
  "connect-src 'self' https://api.genaro.dft",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'"
].join('; ');

export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', DEFAULT_CSP);
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Custom middleware to add security headers
export const addSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add custom security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent page from loading in iframe (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable browser's XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Input validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ValidationError('Validation failed');
    (error as any).details = errors.array();
    throw error;
  }
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizedSnapshots: Record<string, any> = {};
  const rawSnapshots: Record<string, any> = {};
  const payloads: Array<[string, any]> = [
    ['body', req.body],
    ['query', req.query],
    ['params', req.params]
  ];

  payloads.forEach(([key, value]) => {
    if (value) {
      rawSnapshots[key] = cloneValue(value);
      const sanitized = sanitizeObject(value);
      sanitizedSnapshots[key] = sanitized;
      assignSanitizedValue(req, key, sanitized);

      if (hasSanitizationChanges(value, sanitized)) {
        SecurityLogger.log('warn', 'Input sanitization detected suspicious payload', {
          location: key,
          path: req.path,
          method: req.method,
        });
      }
    }
  });

  if (Object.keys(sanitizedSnapshots).length > 0) {
    Object.defineProperty(req, 'sanitized', {
      value: sanitizedSnapshots,
      enumerable: false,
      configurable: false,
      writable: false
    });
  }

  if (Object.keys(rawSnapshots).length > 0) {
    Object.defineProperty(req, 'rawPayloads', {
      value: rawSnapshots,
      enumerable: false,
      configurable: false,
      writable: false
    });
  }
  
  next();
};

// Helper function to sanitize an object recursively
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

function cloneValue(value: any): any {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => cloneValue(item));
  }

  const cloned: any = {};
  for (const [key, val] of Object.entries(value)) {
    cloned[key] = cloneValue(val);
  }
  return cloned;
}

function assignSanitizedValue(req: Request, key: string, sanitized: any) {
  switch (key) {
    case 'body':
      req.body = sanitized;
      break;
    case 'query':
      req.query = sanitized;
      break;
    case 'params':
      req.params = sanitized;
      break;
    default:
      break;
  }
}

function hasSanitizationChanges(original: any, sanitized: any): boolean {
  if (original === sanitized) {
    return false;
  }
  
  try {
    return JSON.stringify(original) !== JSON.stringify(sanitized);
  } catch {
    return true;
  }
}

// Content security validation middleware
export const validateContentSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Only validate certain content types
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const content = JSON.stringify(req.body);
    const validation = validateContent(content);
    
    if (!validation.isSafe) {
      SecurityLogger.log('warn', 'Security validation failed for request', {
        path: req.path,
        method: req.method,
        issues: validation.issues,
        ip: req.ip
      });
      
      // For now, just log issues. In a real implementation, you might want to reject the request
      // throw new ValidationError('Content validation failed');
    }
  }
  
  next();
};

// CORS configuration
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://genaro.dft',
      'https://app.genaro.dft'
    ];
    
    if (isValidOrigin(origin, allowedOrigins)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// API key authentication middleware
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    throw new ApiError('API key is required', 401);
  }
  
  // In a real implementation, you would validate the API key against a database
  // For now, we'll just check if it matches an expected pattern
  if (!apiKey.match(/^[a-zA-Z0-9]{32}$/)) {  // Basic format validation
    SecurityLogger.log('warn', 'Invalid API key format', {
      apiKeyPrefix: apiKey?.substring(0, 8),
      path: req.path,
      ip: req.ip
    });
    
    throw new ApiError('Invalid API key', 401);
  }
  
  // If validation passes, add user info to request
  (req as any).apiKeyValidated = true;
  
  next();
};

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    throw new ApiError('Access token is required', 401);
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const decoded = verifyJwtToken(token, secret);
    
    // Add user info to request
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    throw error instanceof ApiError ? error : new ApiError('Invalid access token', 401);
  }
};

// Permission-based authorization middleware
export type Permission = 'read' | 'write' | 'admin' | 'delete';

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      throw new ApiError('Authentication required', 401);
    }
    
    // In a real implementation, permissions would be checked against a database
    // For now, we'll implement a basic check
    const userPermissions: Permission[] = user.permissions || ['read'];
    
    if (!userPermissions.includes(permission) && !userPermissions.includes('admin')) {
      throw new ApiError(`Insufficient permissions. Requires: ${permission}`, 403);
    }
    
    next();
  };
};

// Security audit logging middleware
export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log security-relevant actions
    const logData = {
      action,
      userId: (req as any).user?.id,
      apiKey: (req as any).apiKeyValidated ? 'valid' : 'none',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString()
    };
    
    SecurityLogger.log('info', `Security audit: ${action}`, logData);
    
    // Continue with the request
    next();
  };
};

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = normalized + (padding ? '='.repeat(4 - padding) : '');
  return Buffer.from(padded, 'base64');
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function verifyJwtToken(token: string, secret: string): Record<string, any> {
  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new ApiError('Invalid access token', 401);
  }
  
  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const expectedSignature = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(signingInput).digest()
  );
  
  const providedSignature = base64UrlDecode(signatureSegment);
  const expectedSignatureBuffer = base64UrlDecode(expectedSignature);
  
  if (
    providedSignature.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer)
  ) {
    throw new ApiError('Invalid access token', 401);
  }
  
  const payloadBuffer = base64UrlDecode(payloadSegment);
  
  let payload: Record<string, any>;
  try {
    payload = JSON.parse(payloadBuffer.toString('utf8'));
  } catch {
    throw new ApiError('Invalid access token', 401);
  }
  
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new ApiError('Access token has expired', 401);
  }
  
  return payload;
}

// Security health check
export const securityHealthCheck = (req: Request, res: Response) => {
  res.json({
    status: 'secure',
    timestamp: new Date().toISOString(),
    checks: {
      rateLimiting: 'active',
      contentSecurity: 'active',
      inputValidation: 'active',
      authentication: 'required',
      auditLogging: 'active'
    }
  });
};

// Export all middleware for easy import
export const securityMiddlewares = {
  apiLimiter,
  authLimiter,
  securityMiddleware,
  addSecurityHeaders,
  validateRequest,
  sanitizeInput,
  validateContentSecurity,
  corsOptions,
  apiKeyAuth,
  jwtAuth,
  requirePermission,
  auditLog,
  securityHealthCheck
};
