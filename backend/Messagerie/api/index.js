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
  res.json({ status: 'ok', service: 'messaging-service' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Messaging service is running' });
});

// Load routes with error handling
let messagingRoutes, sequelize, models;
let routesLoaded = false;
let loadError = null;

try {
  sequelize = require('../../auth-service/config');
  models = require('../models');
  messagingRoutes = require('../routes/messaging');
  
  app.use('/api/messaging', messagingRoutes);
  routesLoaded = true;
  console.log("✅ Messaging routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load messaging routes:", error.message);
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
