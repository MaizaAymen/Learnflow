const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const sequelize = require('../../auth-service/config');

const Conversation = sequelize.define('conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: randomUUID,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('direct', 'group'),
    defaultValue: 'direct',
    comment: 'Conversation type: direct or group'
  },
  group_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Name for group conversations'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID who created the conversation'
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp of last message for sorting'
  }
}, {
  schema: 'referentiels',
  tableName: 'conversations',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['created_by'] },
    { fields: ['last_message_at'] },
    { fields: ['type'] }
  ]
});

module.exports = Conversation;
