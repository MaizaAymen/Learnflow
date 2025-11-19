const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const sequelize = require('../../auth-service/config');

const ConversationParticipant = sequelize.define('conversation_participant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: randomUUID,
    primaryKey: true
  },
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to conversation'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to utilisateur in auth schema'
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When user joined the conversation'
  },
  left_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When user left (null = still member)'
  }
}, {
  schema: 'referentiels',
  tableName: 'conversation_participants',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['conversation_id'] },
    { fields: ['user_id'] },
    { unique: true, fields: ['conversation_id', 'user_id'] }
  ]
});

module.exports = ConversationParticipant;
