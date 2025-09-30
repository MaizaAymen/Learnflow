// models/Classe.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Niveau = require('./Niveau');

const Classe = sequelize.define('Classe', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: false }, // ex: G1, 2ème Info A
  effectif: { type: DataTypes.INTEGER, allowNull: true },
  niveau_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  
}, {
  schema: "referentiels",
  tableName: "classe",
});

Niveau.hasMany(Classe, { foreignKey: "niveau_id" });
Classe.belongsTo(Niveau, { foreignKey: "niveau_id" });

module.exports = Classe;
