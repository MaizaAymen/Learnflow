const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Internship = sequelize.define('Internship', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // in weeks
      allowNull: true,
    },
    supervisorName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supervisorEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supervisorPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    topics: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'),
      defaultValue: 'pending',
    },
    reportSubmitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reportPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reportSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assignedTeacher: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    evaluationScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0, max: 20 },
    },
    evaluationFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    evaluatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    evaluatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approvedAt: {
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
    tableName: 'internships',
    timestamps: true,
  });

  return Internship;
};
