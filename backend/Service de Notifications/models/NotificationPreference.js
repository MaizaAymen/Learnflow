const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const sequelize = require('../config');

const NotificationPreference = sequelize.define('notification_preference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: randomUUID,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'Reference to utilisateur in auth schema'
  },
  event_created: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Notify when new event is created'
  },
  event_registered: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Notify when user registers for event'
  },
  absence_registered: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Notify student when absence is registered'
  },
  elimination_risk: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Alert when student is at risk of elimination'
  },
  schedule_changed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Notify when schedule changes'
  },
  message_received: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Notify on new message'
  },
  document_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Notify when document is published'
  },
  announcement_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Notify when announcement is published'
  },
  account_created: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Notify on account creation'
  },
  email_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Send email notifications'
  },
  sms_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Send SMS notifications'
  },
  quiet_hours_start: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Start time for quiet hours (no notifications)'
  },
  quiet_hours_end: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'End time for quiet hours (no notifications)'
  }
}, {
  schema: 'referentiels',
  tableName: 'notification_preferences',
  timestamps: true,
  underscored: true
});

module.exports = NotificationPreference;
