const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentRequest = sequelize.define('StudentRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('absence_justification', 'certificate_request', 'transcript_request', 'complaint', 'administrative', 'other'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_review', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending',
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    responseFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'student_requests',
    timestamps: true,
  });

  return StudentRequest;
};
