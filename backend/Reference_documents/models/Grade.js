const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Grade = sequelize.define('Grade', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    gradeType: {
      type: DataTypes.ENUM('exam', 'homework', 'project', 'participation', 'midterm', 'final'),
      allowNull: false,
    },
    marks: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0, max: 20 },
    },
    maxMarks: {
      type: DataTypes.FLOAT,
      defaultValue: 20,
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      defaultValue: 1,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    publishedToStudent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: 'grades',
    timestamps: true,
  });

  return Grade;
};
