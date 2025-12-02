const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SurveyQuestion = sequelize.define('SurveyQuestion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    surveyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('rating', 'text', 'choice', 'multiple_choice'),
      defaultValue: 'rating',
    },
    questionOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    estObligatoire: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'survey_questions',
    schema: 'auth',
    timestamps: false,
  });

  return SurveyQuestion;
};
