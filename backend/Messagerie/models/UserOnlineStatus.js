const { DataTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const sequelize = require('../../auth-service/config');

const UserOnlineStatus = sequelize.define('user_online_status', {
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
  is_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Current online status'
  },
  last_seen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Last activity timestamp'
  },
  socket_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Active Socket.io connection ID'
  }
}, {
  schema: 'referentiels',
  tableName: 'user_online_status',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['is_online'] },
    { fields: ['last_seen'] }
  ]
});

module.exports = UserOnlineStatus;
