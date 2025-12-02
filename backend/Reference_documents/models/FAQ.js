const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FAQ = sequelize.define('FAQ', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    categorie: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reponse: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ordre: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    utileCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    nonUtileCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    dateCreation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: 'faqs',
    schema: 'auth',
    timestamps: false,
  });

  return FAQ;
};
