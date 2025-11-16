const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const Schedule = sequelize.define('Schedule', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  time_slot_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true
    // Made optional - we now store time directly in the schedule
  },
  day_of_week: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Day of week: Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi'
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Start time of the schedule'
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'End time of the schedule'
  },
  classe_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  matiere_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  salle_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  enseignant_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  date_debut: { 
    type: DataTypes.DATEONLY, 
    allowNull: false
  },
  date_fin: { 
    type: DataTypes.DATEONLY, 
    allowNull: true
  },
  type_cours: { 
    type: DataTypes.ENUM('Cours', 'TD', 'TP', 'Examen', 'Soutien'), 
    defaultValue: 'Cours'
  },
  recurrence: { 
    type: DataTypes.ENUM('unique', 'hebdomadaire', 'bihebdomadaire', 'mensuelle'), 
    defaultValue: 'hebdomadaire'
  },
  statut: { 
    type: DataTypes.ENUM('planifie', 'confirme', 'annule', 'termine', 'reporte'), 
    defaultValue: 'planifie'
  },
  notes: { 
    type: DataTypes.TEXT, 
    allowNull: true
  },
  couleur: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Hex color code for calendar display',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  }
}, {
  schema: "referentiels",
  tableName: "schedule",
  timestamps: true,
  validate: {
    // Custom validation to ensure date_fin >= date_debut
    dateFinAfterDateDebut() {
      if (this.date_debut && this.date_fin) {
        const debut = new Date(this.date_debut);
        const fin = new Date(this.date_fin);
        
        if (fin < debut) {
          throw new Error('La date de fin doit être après ou égale à la date de début');
        }
      }
    }
  }
});

// Relationships are defined in models/index.js to avoid circular dependencies

module.exports = Schedule;
