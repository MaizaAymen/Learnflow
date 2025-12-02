const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HelpDesk = sequelize.define('HelpDesk', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    numeroTicket: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    categorie: {
      type: DataTypes.ENUM('technique', 'academique', 'administratif', 'autre'),
      defaultValue: 'autre',
    },
    priorite: {
      type: DataTypes.ENUM('basse', 'normale', 'haute', 'urgente'),
      defaultValue: 'normale',
    },
    statut: {
      type: DataTypes.ENUM('ouvert', 'en_cours', 'resolu', 'ferme'),
      defaultValue: 'ouvert',
    },
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    dateCreation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dateResolution: {
      type: DataTypes.DATE,
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
    tableName: 'help_desks',
    schema: 'auth',
    timestamps: false,
  });

  return HelpDesk;
};
