const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'notifications-service' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Notifications service is running',
    timestamp: new Date().toISOString()
  });
});

// Load routes with error handling
let notificationsRoutes, preferencesRoutes, webhooksRouter;
let sequelize, models;
let routesLoaded = false;
let loadError = null;

try {
  sequelize = require('../config');
  models = require('../models');
  notificationsRoutes = require('../routes/notifications');
  preferencesRoutes = require('../routes/preferences');
  const webhooks = require('../routes/webhooks');
  webhooksRouter = webhooks.router;
  
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/preferences', preferencesRoutes);
  app.use('/api/webhooks', webhooksRouter);
  
  routesLoaded = true;
  console.log("✅ Notifications routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load notifications routes:", error.message);
  loadError = error.message;
}

// Fallback error route
if (!routesLoaded) {
  app.use('/api', (req, res) => {
    res.status(500).json({ error: 'Routes failed to load', message: loadError });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: err.message });
});

// Export for Vercel serverless
module.exports = app;
