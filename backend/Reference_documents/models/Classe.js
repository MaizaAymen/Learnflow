const { DataTypes } = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');

const Classe = sequelize.define('Classe', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  nom: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  effectif: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 500
    }
  },
  niveau_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  // REMOVED: departement_id (redundant - can be derived from Niveau → Spécialité → Département)
  // If needed, use: Classe.niveau.specialite.departement
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  annee_scolaire: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: () => {
      const year = new Date().getFullYear();
      return `${year}-${year + 1}`;
    }
  }
}, {
  schema: "referentiels",
  tableName: "classe",
  timestamps: true
});

// Relationships are defined in a separate file to avoid circular dependencies
// See models/index.js for relationship initialization

module.exports = Classe;