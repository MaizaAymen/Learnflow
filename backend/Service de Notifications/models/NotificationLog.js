const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const sequelize = require('../config');

const NotificationLog = sequelize.define('notification_log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: randomUUID,
    primaryKey: true
  },
  notification_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to notification'
  },
  event_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Type of event that triggered notification'
  },
  trigger_source: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Service that triggered (events, absences, schedule, etc.)'
  },
  source_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'ID of the resource that triggered (event_id, absence_id, etc.)'
  },
  delivery_status: {
    type: DataTypes.ENUM('pending', 'delivered', 'failed'),
    defaultValue: 'pending',
    comment: 'Delivery status'
  },
  delivery_method: {
    type: DataTypes.ENUM('in_app', 'email', 'sms', 'webhook'),
    defaultValue: 'in_app',
    comment: 'How notification was delivered'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error details if delivery failed'
  },
  retry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_retry_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  schema: 'referentiels',
  tableName: 'notification_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['notification_id'] },
    { fields: ['event_type'] },
    { fields: ['trigger_source'] },
    { fields: ['delivery_status'] }
  ]
});

module.exports = NotificationLog;
