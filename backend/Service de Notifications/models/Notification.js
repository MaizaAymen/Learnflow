const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const sequelize = require('../config');

const Notification = sequelize.define('notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: randomUUID,
    primaryKey: true
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to utilisateur in auth schema'
  },
  type: {
    type: DataTypes.ENUM(
      'event_created',
      'event_registered',
      'absence_registered',
      'elimination_risk',
      'schedule_changed',
      'message_received',
      'document_published',
      'announcement_published',
      'account_created',
      'custom'
    ),
    allowNull: false,
    comment: 'Type of notification'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional data: event_id, absence_id, message_id, schedule_id, etc.'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
    comment: 'Notification priority level'
  },
  action_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to navigate to when clicking notification'
  }
}, {
  schema: 'referentiels',
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['recipient_id'] },
    { fields: ['type'] },
    { fields: ['is_read'] },
    { fields: ['created_at'] },
    { fields: ['recipient_id', 'is_read'] }
  ]
});

module.exports = Notification;
