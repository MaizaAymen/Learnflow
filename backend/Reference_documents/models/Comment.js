const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetType: {
      type: DataTypes.ENUM('course', 'announcement', 'event', 'project', 'document'),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    parentCommentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    replies: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    likes: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'comments',
    timestamps: true,
    indexes: [
      { fields: ['targetType', 'targetId'] },
      { fields: ['authorId'] },
      { fields: ['parentCommentId'] },
    ],
  });

  return Comment;
};
