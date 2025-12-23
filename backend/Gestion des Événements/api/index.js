const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  credentials: true
}));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'events-service' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Events service running' });
});

// Load routes with error handling
let eventsRoutes, sequelize, models;
let routesLoaded = false;
let loadError = null;

try {
  sequelize = require('../../auth-service/config');
  models = require('../models');
  eventsRoutes = require('../routes/events');
  
  app.use('/api/events', eventsRoutes);
  routesLoaded = true;
  console.log("✅ Events routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load events routes:", error.message);
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
