/**
 * Local Development Server
 * Run this locally to test all microservices before deploying to Vercel
 * 
 * Usage: node dev-server.js
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authApp from './api/auth/index.js';
import eventsApp from './api/events/index.js';
import messagingApp from './api/messaging/index.js';
import notificationsApp from './api/notifications/index.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());

// ========================================
// MOUNT MICROSERVICES
// ========================================

app.use('/api/auth', authApp);
app.use('/api/events', eventsApp);
app.use('/api/messaging', messagingApp);
app.use('/api/notifications', notificationsApp);

// ========================================
// ROOT ENDPOINT
// ========================================

app.get('/', (req, res) => {
  res.json({
    message: 'Learnflow API Server (Development)',
    services: [
      { name: 'Auth', endpoint: '/api/auth/health' },
      { name: 'Events', endpoint: '/api/events/health' },
      { name: 'Messaging', endpoint: '/api/messaging/health' },
      { name: 'Notifications', endpoint: '/api/notifications/health' }
    ]
  });
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  LEARNFLOW API SERVER (Development)    ║
║  Running on http://localhost:${PORT}  ║
╚════════════════════════════════════════╝

Available Services:
  ✅ Auth          → http://localhost:${PORT}/api/auth/health
  ✅ Events        → http://localhost:${PORT}/api/events/health
  ✅ Messaging     → http://localhost:${PORT}/api/messaging/health
  ✅ Notifications → http://localhost:${PORT}/api/notifications/health

Press Ctrl+C to stop the server
  `);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});
