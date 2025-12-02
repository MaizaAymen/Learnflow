const { DataTypes } = require('sequelize');

// ChatSupport model - Public chat room where students talk to admins
module.exports = (sequelize) => {
  const ChatSupport = sequelize.define('chatSupport', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Chat room title (e.g., "General Support", "Technical Help")'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Chat room description'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the chat room is active'
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Admin assigned to this chat room'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Chat room creation timestamp'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Chat room last update timestamp'
    }
  }, {
    timestamps: true,
    underscored: false,
    indexes: [
      { fields: ['adminId'] },
      { fields: ['isActive'] }
    ]
  });

  return ChatSupport;
};
