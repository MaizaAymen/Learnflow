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

// Import and apply authentication middleware
const authenticateToken = require('./middleware/auth');
app.use(authenticateToken);

// ============================================================================
// DATABASE INITIALIZATION (Use service-specific sequelize config)
// ============================================================================
const sequelize = require('./config');
const models = require('./models');
const {
  Notification,
  NotificationPreference,
  NotificationLog
} = models;

// ============================================================================
// ROUTES
// ============================================================================
const notificationsRoutes = require('./routes/notifications');
const preferencesRoutes = require('./routes/preferences');
const { router: webhooksRouter, notificationService, eventBridgeService } = require('./routes/webhooks');

app.use('/api/notifications', notificationsRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/webhooks', webhooksRouter);

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'Notifications service is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ADMIN ENDPOINTS FOR TESTING
// ============================================================================

/**
 * POST /api/admin/test-notification - Test notification creation
 * Body: { recipient_id, type, title, content }
 */
app.post('/api/admin/test-notification', async (req, res) => {
  try {
    const { recipient_id, type, title, content, metadata, priority } = req.body;

    if (!recipient_id || !type || !title || !content) {
      return res.status(400).json({
        error: 'recipient_id, type, title, and content are required'
      });
    }

    const notification = await notificationService.createNotification({
      recipient_id,
      type,
      title,
      content,
      metadata: metadata || {},
      priority: priority || 'medium',
      trigger_source: 'test',
      source_id: 'test-' + Date.now()
    });

    res.json({
      message: '✅ Test notification created',
      notification
    });
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/trigger-event - Trigger event manually
 * Body: { event_type, data }
 */
app.post('/api/admin/trigger-event', (req, res) => {
  try {
    const { event_type, data } = req.body;

    if (!event_type || !data) {
      return res.status(400).json({
        error: 'event_type and data are required'
      });
    }

    notificationService.emit(event_type, data);

    res.json({
      message: `✅ Event '${event_type}' triggered`,
      data
    });
  } catch (error) {
    console.error('❌ Error triggering event:', error);
    res.status(500).json({ error: error.message });
  }
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
    console.log('✅ All Notifications models synced with DB');

    // 4. Re-enable foreign key constraints
    await sequelize.query('SET session_replication_role = DEFAULT;');
    console.log('✅ Foreign key constraints enabled');

    // Start server
    const PORT = process.env.PORT || 3005;
    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║    🔔 Notifications Service Started Successfully         ║
║    📍 Server running on port: ${PORT}                         ║
║    📊 Database: auth_service (referentiels schema)       ║
║    🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}   ║
║    ⚡ Event listeners: Ready                              ║
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

module.exports = { app, server, notificationService, eventBridgeService };
