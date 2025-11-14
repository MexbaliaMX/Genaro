const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
let validationResult;

try {
  const apiValidatorPath = path.join(__dirname, '..', 'api', 'v1', 'node_modules', 'express-validator');
  if (fs.existsSync(apiValidatorPath)) {
    ({ validationResult } = require(apiValidatorPath));
  } else {
    ({ validationResult } = require('express-validator'));
  }
} catch (error) {
  ({ validationResult } = require('express-validator'));
}
const { SecurityLogger, isValidOrigin, validateContent, securityHeaders, RateLimiter } = require('../security/audit');
const { ApiError, ValidationError, RateLimitError } = require('../utils/error-handling');

const createRateLimitMiddleware = (windowMs, max) => {
  const limiter = new RateLimiter(windowMs, max);
  
  return (req, res, next) => {
    const identifier = req.ip || req.get('x-forwarded-for') || 'unknown';
    const result = limiter.isAllowed(identifier);
    
    if (!result.allowed) {
      throw new RateLimitError(result.message);
    }
    
    res.setHeader('RateLimit-Policy', `${max};w=${windowMs / 1000}`);
    if (result.resetTime) {
      res.setHeader('RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
    }
    
    next();
  };
};

const apiLimiter = createRateLimitMiddleware(15 * 60 * 1000, 100);
const authLimiter = createRateLimitMiddleware(15 * 60 * 1000, 5);

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

const securityMiddleware = (req, res, next) => {
  res.setHeader('Content-Security-Policy', DEFAULT_CSP);
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

const addSecurityHeaders = (req, res, next) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ValidationError('Validation failed');
    error.details = errors.array();
    throw error;
  }
  next();
};

const sanitizeInput = (req, res, next) => {
  const sanitizedSnapshots = {};
  const payloads = [
    ['body', req.body],
    ['query', req.query],
    ['params', req.params]
  ];

  payloads.forEach(([key, value]) => {
    if (value) {
      const sanitized = sanitizeObject(value);
      sanitizedSnapshots[key] = sanitized;

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
  
  next();
};

function sanitizeObject(obj) {
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
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

function hasSanitizationChanges(original, sanitized) {
  if (original === sanitized) {
    return false;
  }
  
  try {
    return JSON.stringify(original) !== JSON.stringify(sanitized);
  } catch {
    return true;
  }
}

const validateContentSecurity = (req, res, next) => {
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
    }
  }
  
  next();
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
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

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    throw new ApiError('API key is required', 401);
  }
  
  if (!apiKey.match(/^[a-zA-Z0-9]{32}$/)) {
    SecurityLogger.log('warn', 'Invalid API key format', {
      apiKeyPrefix: apiKey?.substring(0, 8),
      path: req.path,
      ip: req.ip
    });
    
    throw new ApiError('Invalid API key', 401);
  }
  
  req.apiKeyValidated = true;
  next();
};

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    throw new ApiError('Access token is required', 401);
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const decoded = verifyJwtToken(token, secret);
    
    req.user = decoded;
    
    next();
  } catch (error) {
    throw error instanceof ApiError ? error : new ApiError('Invalid access token', 401);
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      throw new ApiError('Authentication required', 401);
    }
    
    const userPermissions = user.permissions || ['read'];
    
    if (!userPermissions.includes(permission) && !userPermissions.includes('admin')) {
      throw new ApiError(`Insufficient permissions. Requires: ${permission}`, 403);
    }
    
    next();
  };
};

const auditLog = (action) => {
  return (req, res, next) => {
    const logData = {
      action,
      userId: req.user?.id,
      apiKey: req.apiKeyValidated ? 'valid' : 'none',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString()
    };
    
    SecurityLogger.log('info', `Security audit: ${action}`, logData);
    
    next();
  };
};

const base64UrlDecode = (input) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = normalized + (padding ? '='.repeat(4 - padding) : '');
  return Buffer.from(padded, 'base64');
};

const base64UrlEncode = (buffer) => {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const verifyJwtToken = (token, secret) => {
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
  
  let payload;
  try {
    payload = JSON.parse(payloadBuffer.toString('utf8'));
  } catch {
    throw new ApiError('Invalid access token', 401);
  }
  
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new ApiError('Access token has expired', 401);
  }
  
  return payload;
};

const securityHealthCheck = (req, res) => {
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

const securityMiddlewares = {
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

module.exports = {
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
  securityHealthCheck,
  securityMiddlewares
};
