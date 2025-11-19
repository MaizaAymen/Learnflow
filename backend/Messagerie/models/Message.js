const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const sequelize = require('../../auth-service/config');

const Message = sequelize.define('message', {
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
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to utilisateur in auth schema'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Message read status'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when message was read'
  }
}, {
  schema: 'referentiels',
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['conversation_id'] },
    { fields: ['sender_id'] },
    { fields: ['is_read'] }
  ]
});

module.exports = Message;
