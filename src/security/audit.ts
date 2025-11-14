import { randomBytes } from 'crypto';

/**
 * Security audit utilities for Genaro DFT 2.0 platform
 * Implements various security checks and validations
 */

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate URL to prevent open redirect attacks
export const isValidUrl = (url: string, allowedDomains: string[] = []): boolean => {
  try {
    const parsedUrl = new URL(url);
    
    // If allowed domains are specified, check against them
    if (allowedDomains.length > 0) {
      return allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
    }
    
    // Otherwise, only allow http/https protocols
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const decodeBase64 = (value: string): void => {
  if (typeof Buffer !== 'undefined') {
    Buffer.from(value, 'base64').toString('binary');
    return;
  }
  
  const atobFn = (globalThis as any)?.atob;
  if (typeof atobFn === 'function') {
    atobFn(value);
    return;
  }
  
  throw new Error('Base64 decoding not supported in this environment');
};

// Validate JWT token format (without verification)
export const isValidJwt = (token: string): boolean => {
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

// Content Security Policy builder
export const buildCsp = (options: {
  directives?: Record<string, string | string[]>;
  reportOnly?: boolean;
}): string => {
  const defaultDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https://api.genaro.dft'],
    'frame-src': ["'none'"], // Prevent iframe embedding by default
    'object-src': ["'none'"], // Prevent plugins
    'base-uri': ["'none'"],
    'form-action': ["'self'"], // Only allow forms to submit to same origin
  };

  const allDirectives = { ...defaultDirectives, ...options.directives };
  const cspString = Object.entries(allDirectives)
    .map(([directive, values]) => {
      const valueList = Array.isArray(values) ? values.join(' ') : values;
      return `${directive} ${valueList}`;
    })
    .join('; ');

  return options.reportOnly ? `Content-Security-Policy-Report-Only: ${cspString}` : `Content-Security-Policy: ${cspString}`;
};

// Validate CORS origin
export const isValidOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
};

// Check password strength
export const isPasswordSecure = (password: string): { isValid: boolean; feedback: string[] } => {
  const feedback: string[] = [];
  
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

// Generate secure random tokens
export const generateSecureToken = (length: number = 32): string => {
  const cryptoApi = (globalThis as any)?.crypto;
  
  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    const array = new Uint8Array(length);
    cryptoApi.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  return randomBytes(length).toString('hex');
};

// Validate content for potential security issues
export const validateContent = (content: string): { isSafe: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for potential XSS patterns
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
  
  // Check for potential SQL injection patterns
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

// Security headers for API responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// Rate limiting information
export interface RateLimitInfo {
  windowMs: number;
  maxRequests: number;
  message: string;
}

// Basic rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private windowMs: number = 15 * 60 * 1000, // 15 minutes
              private maxAttempts: number = 100) {}
  
  isAllowed(identifier: string): { allowed: boolean; resetTime?: number; message?: string } {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt) {
      // First attempt, allow it
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true };
    }
    
    if (now > attempt.resetTime) {
      // Window passed, reset counter
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true };
    }
    
    if (attempt.count >= this.maxAttempts) {
      // Rate limit exceeded
      return {
        allowed: false,
        resetTime: attempt.resetTime,
        message: 'Rate limit exceeded. Please try again later.'
      };
    }
    
    // Increment counter
    this.attempts.set(identifier, { 
      count: attempt.count + 1, 
      resetTime: attempt.resetTime 
    });
    
    return { allowed: true };
  }
}

// Security audit log
export class SecurityLogger {
  static log(level: 'info' | 'warn' | 'error' | 'critical', message: string, metadata?: Record<string, any>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };
    
    // In a real implementation, this would send to a security SIEM or logging system
    const consoleMethod = level === 'critical' ? 'error' : level;
    const logger = (console as any)[consoleMethod] || console.log;
    logger.call(console, 'SECURITY:', logEntry);
  }
  
  static error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }
  
  static critical(message: string, metadata?: Record<string, any>) {
    this.log('critical', message, metadata);
  }
}
