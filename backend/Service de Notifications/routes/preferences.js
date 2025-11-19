const express = require('express');
const router = express.Router();
const { NotificationPreference } = require('../models');

/**
 * GET /api/preferences - Get notification preferences for current user
 */
router.get('/', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;
    
    console.log('📋 GET /preferences - userId:', userId);

    let preferences = await NotificationPreference.findOne({
      where: { user_id: userId }
    });

    // Create default preferences if not exist
    if (!preferences) {
      preferences = await NotificationPreference.create({
        user_id: userId
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('❌ Error fetching preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/preferences - Update notification preferences
 */
router.put('/', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;
    
    console.log('📋 PUT /preferences - userId:', userId);

    let preferences = await NotificationPreference.findOne({
      where: { user_id: userId }
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user_id: userId,
        ...req.body
      });
    } else {
      await preferences.update(req.body);
    }

    res.json({ message: '✅ Preferences updated', preferences });
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/preferences/notification-type/:type - Toggle specific notification type
 */
router.put('/notification-type/:type', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;
    
    const { type } = req.params;
    const { enabled } = req.body;
    
    console.log('📋 PUT /notification-type/:type - userId:', userId, 'type:', type);

    const validTypes = [
      'event_created',
      'event_registered',
      'absence_registered',
      'elimination_risk',
      'schedule_changed',
      'message_received',
      'document_published',
      'announcement_published',
      'account_created'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid notification type: ${type}` });
    }

    let preferences = await NotificationPreference.findOne({
      where: { user_id: userId }
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user_id: userId
      });
    }

    await preferences.update({ [type]: enabled });

    res.json({ message: `✅ ${type} toggled to ${enabled}`, preferences });
  } catch (error) {
    console.error('❌ Error updating preference:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/preferences/quiet-hours - Set quiet hours
 */
router.put('/quiet-hours', async (req, res) => {
  try {
    // Get userId: query parameter takes precedence (for testing), then authenticated user, then default
    let userId = req.query.user_id || req.user?.id || 1;
    
    const { start_time, end_time } = req.body;
    
    console.log('📋 PUT /quiet-hours - userId:', userId);

    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'start_time and end_time are required' });
    }

    let preferences = await NotificationPreference.findOne({
      where: { user_id: userId }
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user_id: userId,
        quiet_hours_start: start_time,
        quiet_hours_end: end_time
      });
    } else {
      await preferences.update({
        quiet_hours_start: start_time,
        quiet_hours_end: end_time
      });
    }

    res.json({ message: '✅ Quiet hours updated', preferences });
  } catch (error) {
    console.error('❌ Error updating quiet hours:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
