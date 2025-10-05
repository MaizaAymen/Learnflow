// models/MatiereEnseignant.js
const { DataTypes } = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');
const Matiere = require('./Matiére');

// Import the User model from auth-service
const User = require('../../auth-service/models/userModel');

const MatiereEnseignant = sequelize.define('MatiereEnseignant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matiere_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Matiere,
      key: 'id'
    }
  },
  enseignant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  schema: "referentiels",
  tableName: "matiere_enseignant",
  timestamps: true
});

// Set up associations
Matiere.belongsToMany(User, { 
  through: MatiereEnseignant, 
  foreignKey: "matiere_id",
  otherKey: "enseignant_id",
  as: 'enseignants'
});

User.belongsToMany(Matiere, { 
  through: MatiereEnseignant, 
  foreignKey: "enseignant_id",
  otherKey: "matiere_id",
  as: 'matieres'
});

module.exports = MatiereEnseignant;
