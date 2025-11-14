/**
 * Genaro DFT 2.0 - Authentication Service
 * 
 * Service to handle user authentication using OAuth2/JWT
 */

import { apiService } from '../services/apiService.js';

export class AuthService {
  constructor() {
    this.tokenKey = 'genaro_auth_token';
    this.userKey = 'genaro_user_data';
    this.refreshTokenKey = 'genaro_refresh_token';
  }

  /**
   * Login user with credentials
   */
  async login(username, password) {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens and user data
        this.setTokens(data.access_token, data.refresh_token);
        this.setUserData(data.user);
        
        // Configure API service with auth token
        apiService.setAuthToken(data.access_token);
        
        return {
          success: true,
          user: data.user,
          message: 'Login successful'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed',
          message: data.message || 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Unable to connect to authentication service'
      };
    }
  }

  /**
   * Logout user and clear tokens
   */
  async logout() {
    // Clear tokens from storage
    this.clearTokens();
    this.clearUserData();
    
    // Remove auth token from API service
    apiService.removeAuthToken();
    
    // Optionally notify the server
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout notification error:', error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      const data = await response.json();

      if (response.ok) {
        // Update tokens
        this.setAccessToken(data.access_token);
        
        // Configure API service with new token
        apiService.setAuthToken(data.access_token);
        
        return data.access_token;
      } else {
        throw new Error(data.error || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear tokens and redirect to login
      this.clearTokens();
      this.clearUserData();
      apiService.removeAuthToken();
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    try {
      const payload = this.parseJWT(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    const userData = sessionStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get access token
   */
  getAccessToken() {
    return sessionStorage.getItem(this.tokenKey);
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return sessionStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Set access token
   */
  setAccessToken(token) {
    sessionStorage.setItem(this.tokenKey, token);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token) {
    sessionStorage.setItem(this.refreshTokenKey, token);
  }

  /**
   * Set both tokens
   */
  setTokens(accessToken, refreshToken) {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  /**
   * Set user data
   */
  setUserData(userData) {
    sessionStorage.setItem(this.userKey, JSON.stringify(userData));
  }

  /**
   * Clear tokens
   */
  clearTokens() {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * Clear user data
   */
  clearUserData() {
    sessionStorage.removeItem(this.userKey);
  }

  /**
   * Parse JWT token to extract payload
   */
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      throw error;
    }
  }

  /**
   * Verify if user has specific role
   */
  hasRole(role) {
    const userData = this.getCurrentUser();
    if (!userData || !userData.roles) {
      return false;
    }
    
    return userData.roles.includes(role);
  }

  /**
   * Verify if user has specific permission
   */
  hasPermission(permission) {
    const userData = this.getCurrentUser();
    if (!userData || !userData.permissions) {
      return false;
    }
    
    return userData.permissions.includes(permission);
  }

  /**
   * Validate token with the server
   */
  async validateToken() {
    try {
      const response = await fetch('/api/v1/auth/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

// Create a singleton instance of the auth service
export const authService = new AuthService();