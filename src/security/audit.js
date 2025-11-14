const { randomBytes } = require('crypto');

/**
 * Security audit utilities for Genaro DFT 2.0 platform
 * Implements various security checks and validations
 */

// Input sanitization functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const isValidUrl = (url, allowedDomains = []) => {
  try {
    const parsedUrl = new URL(url);
    
    if (allowedDomains.length > 0) {
      return allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
    }
    
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const decodeBase64 = (value) => {
  if (typeof Buffer !== 'undefined') {
    Buffer.from(value, 'base64').toString('binary');
    return;
  }
  
  const atobFn = globalThis?.atob;
  if (typeof atobFn === 'function') {
    atobFn(value);
    return;
  }
  
  throw new Error('Base64 decoding not supported in this environment');
};

const isValidJwt = (token) => {
  if (typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    parts.forEach(part => decodeBase64(part));
    return true;
  } catch (e) {
    return false;
  }
};

const buildCsp = (options = {}) => {
  const defaultDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https://api.genaro.dft'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'none'"],
    'form-action': ["'self'"],
  };

  const allDirectives = { ...defaultDirectives, ...(options.directives || {}) };
  const cspString = Object.entries(allDirectives)
    .map(([directive, values]) => {
      const valueList = Array.isArray(values) ? values.join(' ') : values;
      return `${directive} ${valueList}`;
    })
    .join('; ');

  return options.reportOnly ? `Content-Security-Policy-Report-Only: ${cspString}` : `Content-Security-Policy: ${cspString}`;
};

const isValidOrigin = (origin, allowedOrigins) => {
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
};

const isPasswordSecure = (password) => {
  const feedback = [];
  
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  }
  
  return {
    isValid: feedback.length === 0,
    feedback
  };
};

const generateSecureToken = (length = 32) => {
  const cryptoApi = globalThis?.crypto;
  
  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    const array = new Uint8Array(length);
    cryptoApi.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  return randomBytes(length).toString('hex');
};

const validateContent = (content) => {
  const issues = [];
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];
  
  xssPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      issues.push(`Potential XSS vulnerability detected: Pattern ${index + 1}`);
    }
  });
  
  const sqlPatterns = [
    /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT|MERGE|SELECT|UPDATE|UNION( ALL){0,1})\b)/gi,
    /(\b(OR|AND)\s+[\w\s]+=)/gi,
    /('|--|\/\*|\*\/|;|--\s)/gi
  ];
  
  sqlPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      issues.push(`Potential SQL injection detected: Pattern ${index + 1}`);
    }
  });
  
  return {
    isSafe: issues.length === 0,
    issues
  };
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

class RateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxAttempts = 100) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
    this.attempts = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true };
    }
    
    if (now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true };
    }
    
    if (attempt.count >= this.maxAttempts) {
      return {
        allowed: false,
        resetTime: attempt.resetTime,
        message: 'Rate limit exceeded. Please try again later.'
      };
    }
    
    this.attempts.set(identifier, { 
      count: attempt.count + 1, 
      resetTime: attempt.resetTime 
    });
    
    return { allowed: true };
  }
}

class SecurityLogger {
  static log(level, message, metadata) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(metadata || {})
    };
    
    const consoleMethod = level === 'critical' ? 'error' : level;
    const logger = console[consoleMethod] || console.log;
    logger.call(console, 'SECURITY:', logEntry);
  }
  
  static error(message, metadata) {
    this.log('error', message, metadata);
  }
  
  static critical(message, metadata) {
    this.log('critical', message, metadata);
  }
}

module.exports = {
  sanitizeInput,
  isValidUrl,
  isValidJwt,
  buildCsp,
  isValidOrigin,
  isPasswordSecure,
  generateSecureToken,
  validateContent,
  securityHeaders,
  RateLimiter,
  SecurityLogger
};
