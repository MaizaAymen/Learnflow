/**
 * Messaging Service API Handler for Vercel Serverless Functions
 * Handles all internal messaging requests
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
  .then(() => console.log('Messaging Service: DB Connection Successful'))
  .catch(err => console.error('Messaging Service: DB Connection Error', err));

// ========================================
// ROUTES (Import from backend/Messagerie/routes)
// ========================================

// TODO: Import your actual messaging routes
// Example:
// import messagingRoutes from '../../backend/Messagerie/routes/messagingRoutes.js';
// app.use('/messages', messagingRoutes);

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'messaging-service',
    timestamp: new Date().toISOString()
  });
});

app.post('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'messaging-service',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((err, req, res, next) => {
  console.error('[Messaging Service Error]', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    service: 'messaging-service'
  });
});

// ========================================
// EXPORT FOR VERCEL
// ========================================

export default app;
