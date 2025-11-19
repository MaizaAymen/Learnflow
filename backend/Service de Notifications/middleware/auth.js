const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Extracts and verifies JWT token from cookies or Authorization header
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from cookies first, then from Authorization header
    const token = req.cookies?.token || 
                  req.headers.authorization?.split(' ')[1];

    if (!token) {
      // For now, allow unauthenticated requests but warn
      // In production, you would return 401
      console.warn('⚠️ No authentication token provided');
      req.user = { id: 1 }; // Default user for testing
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.warn('⚠️ Token verification failed:', error.message);
    // Allow unauthenticated requests for testing
    req.user = { id: 1 }; // Default user for testing
    next();
  }
};

module.exports = authenticateToken;
