/**
 * Genaro DFT 2.0 - User Management Service
 * 
 * Service for handling user authentication, registration, and profile management
 */

class UserManagementService {
  constructor() {
    // In a real implementation, this would connect to a database
    // For this demo, we'll use an in-memory store
    this.users = new Map();
    
    // Add a default admin user
    this.users.set('admin', {
      id: 'user-1',
      username: 'admin',
      email: 'admin@genaro.local',
      password: this.hashPassword('admin123'), // In a real app, never store plain text
      roles: ['admin'],
      permissions: [],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    });
    
    // Add a default analyst user
    this.users.set('analyst', {
      id: 'user-2',
      username: 'analyst',
      email: 'analyst@genaro.local',
      password: this.hashPassword('analyst123'),
      roles: ['analyst'],
      permissions: [],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    });
  }

  /**
   * Authenticate a user
   */
  async authenticate(username, password) {
    const user = this.users.get(username);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    if (!this.verifyPassword(password, user.password)) {
      throw new Error('Invalid username or password');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Return user object without sensitive information
    return this.sanitizeUser(user);
  }

  /**
   * Register a new user
   */
  async register(userData) {
    // Validate user data
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Username, email, and password are required');
    }

    // Check if user already exists
    if (this.users.has(userData.username)) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    for (const [_, user] of this.users) {
      if (user.email === userData.email) {
        throw new Error('Email already exists');
      }
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: userData.username,
      email: userData.email,
      password: this.hashPassword(userData.password),
      roles: userData.roles || ['viewer'], // Default to viewer role
      permissions: userData.permissions || [],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };

    this.users.set(userData.username, newUser);
    
    return this.sanitizeUser(newUser);
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    const user = this.users.get(username);
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Update user roles
   */
  async updateUserRoles(username, roles) {
    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }

    user.roles = roles;
    return this.sanitizeUser(user);
  }

  /**
   * Activate/deactivate user account
   */
  async setAccountStatus(username, isActive) {
    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = isActive;
    return this.sanitizeUser(user);
  }

  /**
   * Hash password (simplified for demo - use bcrypt in production)
   */
  hashPassword(password) {
    // In a real application, use bcrypt or similar
    // This is just a placeholder
    return require('crypto').createHash('sha256').update(password).digest('hex');
  }

  /**
   * Verify password (simplified for demo)
   */
  verifyPassword(password, hash) {
    // In a real application, use bcrypt.compare
    return this.hashPassword(password) === hash;
  }

  /**
   * Sanitize user object to remove sensitive information
   */
  sanitizeUser(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    };
  }
}

// Export singleton instance
module.exports = new UserManagementService();