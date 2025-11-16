/**
 * Authentication Middleware
 * Reads JWT token from cookies (set by auth-service login)
 */
const jwt = require('jsonwebtoken');
const secretKey = "alex"; // Same as auth-service

const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify and decode JWT
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      // Set user on request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Role-based Authorization Middleware
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};
