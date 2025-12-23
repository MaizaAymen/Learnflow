const express = require("express");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Explicitly require pg and pg-hstore for Vercel serverless bundling
// Sequelize uses dynamic require which bundlers can't detect
const pg = require('pg');
require('pg-hstore');

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS configuration for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  "*"
].filter(Boolean);

app.use(cors({ 
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint - always available
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', env: process.env.NODE_ENV, pgLoaded: !!pg });
});

app.get('/api/auth/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Load routes with error handling
let authRoutes, departmentHeadRoutes, sequelize, User;
let routesLoaded = false;
let loadError = null;

try {
  sequelize = require("./config");
  User = require("./models/userModel");
  authRoutes = require("./routes/authRoutes");
  departmentHeadRoutes = require("./routes/departmentHeadRoutes");
  
  app.use("/api/auth", authRoutes);
  app.use("/api/department-head", departmentHeadRoutes);
  routesLoaded = true;
  console.log("✅ Routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load routes:", error.message);
  loadError = error.message;
}

// Fallback error route if routes failed to load (Express 5 compatible syntax)
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

// For Vercel serverless, export the app
module.exports = app;