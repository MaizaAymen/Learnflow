/**
 * Events Service API Handler for Vercel Serverless Functions
 * Handles all event registration and management requests
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({ path: '.env.local' });

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// DATABASE CONNECTION
// ========================================

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Events Service: DB Connection Successful'))
  .catch(err => console.error('Events Service: DB Connection Error', err));

// ========================================
// ROUTES (Import from backend/Gestion des Événements/routes)
// ========================================

// TODO: Import your actual event routes
// Example:
// import eventRoutes from '../../backend/Gestion des Événements/routes/eventRoutes.js';
// app.use('/events', eventRoutes);

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'events-service',
    timestamp: new Date().toISOString()
  });
});

app.post('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'events-service',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((err, req, res, next) => {
  console.error('[Events Service Error]', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    service: 'events-service'
  });
});

// ========================================
// EXPORT FOR VERCEL
// ========================================

export default app;
