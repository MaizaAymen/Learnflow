const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

// Initialize Express
const app = express();
const server = http.createServer(app);

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// ============================================================================
// DATABASE INITIALIZATION (Use auth-service shared database)
// ============================================================================
const sequelize = require('../auth-service/config');
const models = require('./models');
const {
  Message,
  Conversation,
  ConversationParticipant,
  UserOnlineStatus
} = models;

// ============================================================================
// WEBSOCKET SETUP
// ============================================================================
const MessagingService = require('./services/MessagingService');
const messagingService = new MessagingService(server);

// ============================================================================
// ROUTES
// ============================================================================
const messagingRoutes = require('./routes/messaging');
app.use('/api/messaging', messagingRoutes);

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get('/health', (req, res) => {
  res.json({ status: 'Messaging service is running' });
});

// ============================================================================
// DATABASE & SERVER INITIALIZATION
// ============================================================================
async function initializeServer() {
  try {
    // 1. Create schema if it doesn't exist
    await sequelize.query('CREATE SCHEMA IF NOT EXISTS referentiels;');
    console.log('✅ Referentiels schema created/verified');

    // 2. Disable foreign key constraints during sync
    await sequelize.query('SET session_replication_role = replica;');

    // 3. Sync all models (order doesn't matter now, constraints are disabled)
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ All Messagerie models synced with DB');

    // 4. Re-enable foreign key constraints
    await sequelize.query('SET session_replication_role = DEFAULT;');
    console.log('✅ Foreign key constraints enabled');

    // Start server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║    🚀 Messagerie Service Started Successfully            ║
║    📍 Server running on port: ${PORT}                         ║
║    🔌 WebSocket ready for real-time messaging            ║
║    📊 Database: auth_service (referentiels schema)       ║
║    🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}   ║
╚══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received: Shutting down gracefully...');
      server.close(async () => {
        console.log('✅ Server closed');
        await sequelize.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\n🛑 SIGINT received: Shutting down gracefully...');
      server.close(async () => {
        console.log('✅ Server closed');
        await sequelize.close();
        process.exit(0);
      });
    });

    process.stdin.resume();
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    console.error('Error details:', error.message);

    // Try to re-enable constraints if setup failed
    try {
      await sequelize.query('SET session_replication_role = DEFAULT;');
    } catch (e) {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

initializeServer();

module.exports = { app, server, messagingService };
