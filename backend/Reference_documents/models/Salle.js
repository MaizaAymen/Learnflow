const { DataTypes } = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');

const Salle = sequelize.define('Salle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("Amphi", "TP", "TD", "Cours"), allowNull: false },
  capacite: { type: DataTypes.INTEGER, allowNull: false },
  localisation: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
}, {
  schema: "referentiels",
  tableName: "salle",
});

module.exports = Salle;
