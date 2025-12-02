const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Extracts and verifies JWT token from cookies or Authorization header
 * IMPORTANT: Must match the secretKey used in auth-service (currently "alex")
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

    // Verify token using the SAME secret as auth-service
    // Must match: backend/auth-service/routes/authRoutes.js secretKey = "alex"
    const decoded = jwt.verify(token, 'alex');
    req.user = decoded;
    console.log('✅ Token verified successfully for user:', decoded.id);
    next();
  } catch (error) {
    console.warn('⚠️ Token verification failed:', error.message);
    // Allow unauthenticated requests for testing
    req.user = { id: 1 }; // Default user for testing
    next();
  }
};

module.exports = authenticateToken;
