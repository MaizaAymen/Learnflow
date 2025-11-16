// models/MatiereEnseignant.js
const { DataTypes } = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');

// Import the User model from auth-service
const User = require('../../auth-service/models/userModel');

// Association table between Matiere and Enseignant (User with role teacher)
// Represents which teachers are qualified/authorized to teach which subjects
const MatiereEnseignant = sequelize.define('MatiereEnseignant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matiere_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsToMany() relationship
  },
  enseignant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsToMany() relationship
  },
  is_principal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indicates if this is the main/primary teacher for the subject'
  },
  date_debut: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: 'Start date of assignment'
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'End date of assignment (null = ongoing)'
  },
  specialisation: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Specific expertise or specialization within this matiere'
  }
}, {
  schema: "referentiels",
  tableName: "matiere_enseignant",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['matiere_id', 'enseignant_id'],
      name: 'unique_matiere_enseignant_assignment'
    }
  ],
  validate: {
    // Ensure date_fin >= date_debut
    dateFinAfterDateDebut() {
      if (this.date_debut && this.date_fin) {
        if (new Date(this.date_fin) < new Date(this.date_debut)) {
          throw new Error('La date de fin doit être après la date de début');
        }
      }
    }
  }
});

// Set up associations
const Matiere = require('./Matiére');

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
