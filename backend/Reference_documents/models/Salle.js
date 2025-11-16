const { DataTypes } = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');

const Salle = sequelize.define('Salle', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  nom: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  type: { 
    type: DataTypes.ENUM("Amphi", "TP", "TD", "Cours", "Laboratoire", "Salle_Informatique"), 
    allowNull: false 
  },
  capacite: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: {
      min: 1,
      max: 1000
    }
  },
  departement_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  localisation: { 
    type: DataTypes.STRING(255), 
    allowNull: true 
  },
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  equipements: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of equipment available in the room (projector, computers, etc.)'
  },
  statut: {
    type: DataTypes.ENUM('disponible', 'maintenance', 'hors_service'),
    defaultValue: 'disponible'
  }
}, {
  schema: "referentiels",
  tableName: "salle",
  timestamps: true
});

// Relationships are defined in models/index.js to avoid circular dependencies

module.exports = Salle;
