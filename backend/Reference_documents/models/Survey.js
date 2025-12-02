const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Survey = sequelize.define('Survey', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('draft', 'actif', 'ferme'),
      defaultValue: 'draft',
    },
    dateDebut: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateFin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    typeCollecte: {
      type: DataTypes.ENUM('satisfaction', 'experience', 'feedback', 'evaluation'),
      defaultValue: 'satisfaction',
    },
    cibleSondage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nombreReponses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dateCreation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
    tableName: 'surveys',
    schema: 'auth',
    timestamps: false,
  });

  return Survey;
};
