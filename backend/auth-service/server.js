const express = require("express");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', env: process.env.NODE_ENV });
});

app.get('/api/auth/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Only load routes if not in a crash-debug mode
let authRoutes, departmentHeadRoutes, sequelize, User;

try {
  sequelize = require("./config");
  User = require("./models/userModel");
  authRoutes = require("./routes/authRoutes");
  departmentHeadRoutes = require("./routes/departmentHeadRoutes");
  
  app.use("/api/auth", authRoutes);
  app.use("/api/department-head", departmentHeadRoutes);
  console.log("✅ Routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load routes:", error.message);
  app.get('/api/auth/*', (req, res) => {
    res.status(500).json({ error: 'Routes failed to load', message: error.message });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: err.message });
});

// For Vercel serverless, export the app
module.exports = app;