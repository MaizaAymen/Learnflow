const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');
const TimeSlot = require('./TimeSlot');
const Classe = require('./Classe');
const Matiere = require('./Matiére');
const Salle = require('./Salle');

const Schedule = sequelize.define('Schedule', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  time_slot_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: TimeSlot,
      key: 'id'
    }
  },
  classe_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: Classe,
      key: 'id'
    }
  },
  matiere_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: Matiere,
      key: 'id'
    }
  },
  salle_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: Salle,
      key: 'id'
    }
  },
  enseignant_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true
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
    type: DataTypes.ENUM('unique', 'hebdomadaire', 'bihebdomadaire'), 
    defaultValue: 'hebdomadaire'
  },
  statut: { 
    type: DataTypes.ENUM('planifie', 'confirme', 'annule', 'termine'), 
    defaultValue: 'planifie'
  },
  notes: { 
    type: DataTypes.TEXT, 
    allowNull: true
  }
}, {
  schema: "referentiels",
  tableName: "schedule",
  timestamps: true
});

// Relations
TimeSlot.hasMany(Schedule, { foreignKey: 'time_slot_id', as: 'schedules' });
Schedule.belongsTo(TimeSlot, { foreignKey: 'time_slot_id', as: 'timeSlot' });

Classe.hasMany(Schedule, { foreignKey: 'classe_id', as: 'schedules' });
Schedule.belongsTo(Classe, { foreignKey: 'classe_id', as: 'classe' });

Matiere.hasMany(Schedule, { foreignKey: 'matiere_id', as: 'schedules' });
Schedule.belongsTo(Matiere, { foreignKey: 'matiere_id', as: 'matiere' });

Salle.hasMany(Schedule, { foreignKey: 'salle_id', as: 'schedules' });
Schedule.belongsTo(Salle, { foreignKey: 'salle_id', as: 'salle' });

module.exports = Schedule;
