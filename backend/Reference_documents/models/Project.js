const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    projectType: {
      type: DataTypes.ENUM('project', 'pfe', 'capstone', 'research'),
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    studentGroup: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    topic: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description_detailed: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    objectives: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'in_progress', 'evaluation', 'completed', 'rejected'),
      defaultValue: 'draft',
    },
    submissionDate: {
      type: DataTypes.DATE,
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
    supervisorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    juries: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    reportPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reportSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    presentationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    presentationLocation: {
      type: DataTypes.STRING,
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
    meetings: {
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
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'projects',
    schema: 'auth',
    timestamps: false,
  });

  return Project;
};
