const express = require('express');
const router = express.Router();
const NotificationService = require('../services/NotificationService');
const EventBridgeService = require('../services/EventBridgeService');

// Create shared service instances
const notificationService = new NotificationService();
const eventBridgeService = new EventBridgeService(notificationService);

/**
 * POST /api/webhooks/event - Direct notification from any service
 * This is the primary endpoint used by NotificationClient
 */
router.post('/event', async (req, res) => {
  try {
    const { recipient_id, recipient_ids, type, title, content, metadata, priority } = req.body;

    console.log(`📨 Received direct notification webhook:`, { type, recipient_id, recipients_count: recipient_ids?.length });

    // Handle single recipient
    if (recipient_id) {
      const notification = await notificationService.createNotification({
        recipient_id,
        type,
        title,
        content,
        metadata: metadata || {},
        priority: priority || 'medium',
        trigger_source: 'webhook',
        source_id: `webhook-${Date.now()}`
      });
      console.log(`✅ Notification created for user ${recipient_id}`);
      return res.json({ status: 'created', notification });
    }

    // Handle multiple recipients
    if (recipient_ids && Array.isArray(recipient_ids) && recipient_ids.length > 0) {
      const notifications = [];
      for (const rid of recipient_ids) {
        try {
          const notification = await notificationService.createNotification({
            recipient_id: rid,
            type,
            title,
            content,
            metadata: metadata || {},
            priority: priority || 'medium',
            trigger_source: 'webhook',
            source_id: `webhook-${Date.now()}`
          });
          notifications.push(notification);
        } catch (err) {
          console.warn(`⚠️ Failed to create notification for user ${rid}:`, err.message);
        }
      }
      console.log(`✅ Created ${notifications.length} notifications`);
      return res.json({ status: 'created', count: notifications.length, notifications });
    }

    return res.status(400).json({ error: 'recipient_id or recipient_ids is required' });
  } catch (error) {
    console.error('❌ Error handling direct notification webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/webhooks/events - Webhook from Events Service
 */
router.post('/events', (req, res) => {
  try {
    const { type, data } = req.body;

    console.log(`📨 Received webhook from Events Service:`, type);
    eventBridgeService.handleEventServiceWebhook({ type, data });

    res.json({ status: 'received' });
  } catch (error) {
    console.error('❌ Error handling events webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/webhooks/reference - Webhook from Reference Service
 */
router.post('/reference', (req, res) => {
  try {
    const { type, data } = req.body;

    console.log(`📨 Received webhook from Reference Service:`, type);
    eventBridgeService.handleReferenceServiceWebhook({ type, data });

    res.json({ status: 'received' });
  } catch (error) {
    console.error('❌ Error handling reference webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/webhooks/messaging - Webhook from Messaging Service
 */
router.post('/messaging', (req, res) => {
  try {
    const { type, data } = req.body;

    console.log(`📨 Received webhook from Messaging Service:`, type);
    eventBridgeService.handleMessagingServiceWebhook({ type, data });

    res.json({ status: 'received' });
  } catch (error) {
    console.error('❌ Error handling messaging webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/webhooks/auth - Webhook from Auth Service
 */
router.post('/auth', (req, res) => {
  try {
    const { type, data } = req.body;

    console.log(`📨 Received webhook from Auth Service:`, type);
    eventBridgeService.handleAuthServiceWebhook({ type, data });

    res.json({ status: 'received' });
  } catch (error) {
    console.error('❌ Error handling auth webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/webhooks/content - Webhook from Content Service
 */
router.post('/content', (req, res) => {
  try {
    const { type, data } = req.body;

    console.log(`📨 Received webhook from Content Service:`, type);
    eventBridgeService.handleContentServiceWebhook({ type, data });

    res.json({ status: 'received' });
  } catch (error) {
    console.error('❌ Error handling content webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, notificationService, eventBridgeService };
