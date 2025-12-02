const { DataTypes } = require('sequelize');

// ChatMessage model - Public messages in chat support rooms
module.exports = (sequelize) => {
  const ChatMessage = sequelize.define('chatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chatSupportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to ChatSupport room'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User who posted the message'
    },
    userRole: {
      type: DataTypes.ENUM('etudiant', 'enseignant', 'directeur', 'admin', 'chef_de_department'),
      defaultValue: 'etudiant',
      allowNull: false,
      comment: 'Role of the user who posted the message'
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: 'Message content - visible to everyone in the chat room'
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the message has been edited by admin'
    },
    editedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin ID who edited this message'
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of last edit'
    },
    originalContent: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Original content before edit (for transparency)'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Soft delete flag (only admin can delete)'
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin ID who deleted this message'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of deletion'
    },
    deletionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for deletion (shown to user)'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Message creation timestamp'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Message last update timestamp'
    }
  }, {
    timestamps: true,
    underscored: false,
    indexes: [
      { fields: ['chatSupportId'] },
      { fields: ['userId'] },
      { fields: ['userRole'] },
      { fields: ['isDeleted'] },
      { fields: ['createdAt'] }
    ]
  });

  return ChatMessage;
};
