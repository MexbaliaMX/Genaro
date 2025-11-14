/**
 * Genaro DFT 2.0 - Authentication Middleware
 * 
 * Middleware for handling authentication using JWT tokens
 */

const jwt = require('jsonwebtoken');

class AuthMiddleware {
  constructor(secret = process.env.JWT_SECRET || 'default_secret_for_dev') {
    this.secret = secret;
  }

  /**
   * Middleware to authenticate JWT tokens
   */
  authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Authentication token is missing' 
      });
    }

    jwt.verify(token, this.secret, (err, user) => {
      if (err) {
        return res.status(403).json({ 
          error: 'Invalid or expired token',
          message: 'The authentication token is invalid or has expired' 
        });
      }
      
      // Add user info to request object
      req.user = user;
      next();
    });
  };

  /**
   * Generate JWT token for a user
   */
  generateAccessToken = (user) => {
    // In a real implementation, we'd include minimal necessary information
    const userInfo = {
      userId: user.id,
      username: user.username,
      roles: user.roles || [],
      permissions: user.permissions || []
    };

    // Sign token with user info, expiring in 15 minutes by default
    return jwt.sign(userInfo, this.secret, { expiresIn: '15m' });
  };

  /**
   * Generate refresh token for a user
   */
  generateRefreshToken = (user) => {
    const refreshTokenInfo = {
      userId: user.id,
      timestamp: Date.now()
    };

    // Refresh tokens typically have longer expiry (e.g., 7 days)
    return jwt.sign(refreshTokenInfo, this.secret, { expiresIn: '7d' });
  };

  /**
   * Verify refresh token
   */
  verifyRefreshToken = (token) => {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  };
}

module.exports = AuthMiddleware;