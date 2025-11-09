const { DataTypes } = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');
const Niveau = require('./Niveau');
 

const Classe = sequelize.define('Classe', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: true }, // ex: G1, 2ème Info A
  effectif: { type: DataTypes.INTEGER, allowNull: true },
  niveau_id: { type: DataTypes.INTEGER, allowNull: true },
  departement_id: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  
}, {
  schema: "referentiels",
  tableName: "classe",
});

// Relationships are defined in a separate file to avoid circular dependencies
// See models/index.js for relationship initialization

module.exports = Classe;