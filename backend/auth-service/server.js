const express = require("express");
require('dotenv').config();
const sequelize = require("./config");
const User = require("./models/userModel");
const authRoutes = require("./routes/authRoutes");
const departmentHeadRoutes = require("./routes/departmentHeadRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Ensure uploads directory exists (only in non-serverless environment)
if (process.env.NODE_ENV !== 'production') {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  }
  app.use('/uploads', express.static(uploadsDir));
}

app.use(express.json());
app.use(cookieParser());

// CORS configuration for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.get('/api/auth/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.use("/api/auth", authRoutes);
app.use("/api/department-head", departmentHeadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: err.message });
});

// For Vercel serverless, export the app
module.exports = app;

// For local development, start the server
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  sequelize.sync({ alter: false, logging: false }).then(() => {
    console.log("✅ Models synced with DB");
    app.listen(4000, () => {
      console.log("✅ Auth service running on port 4000");
    });
  }).catch(err => {
    console.error('❌ Failed to sync database:', err);
    process.exit(1);
  });
}