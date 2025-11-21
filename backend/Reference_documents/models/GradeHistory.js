const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GradeHistory = sequelize.define('GradeHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    gradeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    previousMarks: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    newMarks: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    previousFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    newFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changeReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    modifiedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    modifiedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'grade_history',
    timestamps: false,
  });

  return GradeHistory;
};
