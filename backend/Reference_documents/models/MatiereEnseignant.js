// models/MatiereEnseignant.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Matiere = require('./Matiere');
// ⚠️ User est dans service Auth, on garde juste la FK vers "auth.utilisateur"
const User = require('../../auth/models/User');

const MatiereEnseignant = sequelize.define('MatiereEnseignant', {}, {
  schema: "referentiels",
  tableName: "matiere_enseignant",
});

Matiere.belongsToMany(User, { through: MatiereEnseignant, foreignKey: "matiere_id" });
User.belongsToMany(Matiere, { through: MatiereEnseignant, foreignKey: "enseignant_id" });

module.exports = MatiereEnseignant;
