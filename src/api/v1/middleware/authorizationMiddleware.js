/**
 * Genaro DFT 2.0 - Authorization Middleware
 * 
 * Middleware for handling authorization using RBAC (Role-Based Access Control)
 */

class AuthorizationMiddleware {
  constructor() {
    // Define role-based permissions
    this.rolePermissions = {
      'viewer': [
        'read:dashboard',
        'read:narratives',
        'read:metrics',
        'read:search'
      ],
      'analyst': [
        'read:dashboard',
        'read:narratives',
        'read:metrics',
        'read:search',
        'read:analytics',
        'create:briefing',
        'read:briefing'
      ],
      'strategist': [
        'read:dashboard',
        'read:narratives',
        'read:metrics',
        'read:search',
        'read:analytics',
        'create:briefing',
        'read:briefing',
        'create:strategy',
        'simulate:strategy',
        'read:sandbox'
      ],
      'admin': [
        'read:dashboard',
        'read:narratives',
        'read:metrics',
        'read:search',
        'read:analytics',
        'create:briefing',
        'read:briefing',
        'create:strategy',
        'simulate:strategy',
        'read:sandbox',
        'manage:users',
        'manage:roles',
        'manage:permissions',
        'read:system-logs',
        'manage:system-settings'
      ],
      'compliance': [
        'read:dashboard',
        'read:narratives',
        'read:metrics',
        'read:search',
        'read:analytics',
        'read:briefing',
        'read:sandbox',
        'read:system-logs',
        'read:audit-trail',
        'review:content',
        'review:actions'
      ]
    };
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission = (user, requiredPermission) => {
    if (!user || !user.roles) {
      return false;
    }

    // Check if any of the user's roles has the required permission
    for (const role of user.roles) {
      const permissions = this.rolePermissions[role] || [];
      if (permissions.includes(requiredPermission)) {
        return true;
      }
    }

    return false;
  };

  /**
   * Middleware to check if user has a specific permission
   */
  requirePermission = (permission) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access this resource'
        });
      }

      if (!this.hasPermission(req.user, permission)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `You don't have permission to perform this action: ${permission}`
        });
      }

      next();
    };
  };

  /**
   * Middleware to check if user has any of the specified roles
   */
  requireRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access this resource'
        });
      }

      // Normalize input to array
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      const userHasRole = req.user.roles && req.user.roles.some(role => rolesArray.includes(role));

      if (!userHasRole) {
        return res.status(403).json({
          error: 'Insufficient role',
          message: `You must have one of the following roles: ${rolesArray.join(', ')}`
        });
      }

      next();
    };
  };

  /**
   * Get all permissions for a user
   */
  getUserPermissions = (user) => {
    if (!user || !user.roles) {
      return [];
    }

    const permissions = new Set();
    
    for (const role of user.roles) {
      const rolePermissions = this.rolePermissions[role] || [];
      rolePermissions.forEach(permission => permissions.add(permission));
    }

    return Array.from(permissions);
  };

  /**
   * Get all available roles
   */
  getAvailableRoles = () => {
    return Object.keys(this.rolePermissions);
  };

  /**
   * Check if user has at least one of the required permissions
   */
  hasAnyPermission = (user, requiredPermissions) => {
    if (!user || !user.roles) {
      return false;
    }

    for (const permission of requiredPermissions) {
      if (this.hasPermission(user, permission)) {
        return true;
      }
    }

    return false;
  };
}

module.exports = AuthorizationMiddleware;