const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.ENUM('course', 'grade', 'exam', 'schedule', 'event', 'document', 'user', 'department', 'project', 'internship', 'request', 'announcement'),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    entityName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oldValues: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    newValues: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'pending'),
      defaultValue: 'success',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changes: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['entityType', 'entityId'] },
      { fields: ['timestamp'] },
      { fields: ['action'] },
    ],
  });

  return AuditLog;
};
