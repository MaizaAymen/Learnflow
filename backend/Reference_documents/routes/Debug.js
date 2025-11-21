// Debug endpoint to test authentication and see token contents
const express = require('express');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();

  // Test endpoint to debug authentication
  router.get('/debug', authenticate, (req, res) => {
    res.json({
      message: 'Authentication successful!',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  });

  return router;
};