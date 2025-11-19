const express = require('express');
const router = express.Router();
const { Notification, NotificationPreference, NotificationLog } = require('../models');
const { Op } = require('sequelize');

// ============================================================================
// SPECIFIC ROUTES (Must come BEFORE generic /:id routes)
// ============================================================================

/**
 * GET /api/notifications/unread/count - Get unread notification count
 */
router.get('/unread/count', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;

    console.log(`📊 Counting unread for user ${userId}`);

    const count = await Notification.count({
      where: { recipient_id: userId, is_read: false }
    });

    res.json({ unread_count: count });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/mark-all-read - Mark all notifications as read
 */
router.put('/mark-all-read', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;

    const result = await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { recipient_id: userId, is_read: false } }
    );

    res.json({ message: `✅ ${result[0]} notifications marked as read` });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/notifications/batch - Delete multiple notifications
 */
router.delete('/batch', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;

    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'notificationIds must be an array' });
    }

    const result = await Notification.destroy({
      where: {
        id: { [Op.in]: notificationIds },
        recipient_id: userId
      }
    });

    res.json({ message: `✅ ${result} notifications deleted` });
  } catch (error) {
    console.error('❌ Error deleting notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// GENERIC ROUTES (Must come AFTER specific routes)
// ============================================================================

/**
 * GET /api/notifications - Get all notifications for current user
 */
router.get('/', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || req.body?.user_id || 1;
    
    console.log(`📥 Fetching notifications for user ${userId}`);
    console.log(`DEBUG: req.query.user_id = ${req.query.user_id}, req.user?.id = ${req.user?.id}`);

    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;

    const where = { recipient_id: userId };
    if (unread_only === 'true') {
      where.is_read = false;
    }

    console.log(`DEBUG: Querying with where clause:`, where);

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: NotificationLog,
          as: 'logs',
          attributes: ['delivery_status', 'delivery_method', 'created_at']
        }
      ]
    });

    console.log(`DEBUG: Query result - count: ${count}, rows: ${rows.length}`);

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      notifications: rows
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/:id - Get specific notification
 */
router.get('/:id', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;

    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, recipient_id: userId },
      include: [
        {
          model: NotificationLog,
          as: 'logs'
        }
      ]
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('❌ Error fetching notification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/:id/read - Mark notification as read
 */
router.put('/:id/read', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;

    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, recipient_id: userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({
      is_read: true,
      read_at: new Date()
    });

    res.json({ message: '✅ Notification marked as read', notification });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/notifications/:id - Delete notification
 */
router.delete('/:id', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;

    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, recipient_id: userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();

    res.json({ message: '✅ Notification deleted' });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
