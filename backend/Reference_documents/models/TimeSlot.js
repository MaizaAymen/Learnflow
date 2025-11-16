const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const TimeSlot = sequelize.define('TimeSlot', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  day_of_week: { 
    type: DataTypes.ENUM('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'), 
    allowNull: false
  },
  start_time: { 
    type: DataTypes.TIME, 
    allowNull: false
  },
  end_time: { 
    type: DataTypes.TIME, 
    allowNull: false
  },
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true
  },
  description: { 
    type: DataTypes.STRING(255), 
    allowNull: true
  }
}, {
  schema: "referentiels",
  tableName: "time_slot",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['day_of_week', 'start_time', 'end_time']
    }
  ],
  validate: {
    // Custom validation to ensure end_time > start_time
    endTimeAfterStartTime() {
      if (this.start_time && this.end_time) {
        const start = this.start_time.split(':').map(Number);
        const end = this.end_time.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        
        if (endMinutes <= startMinutes) {
          throw new Error('La heure de fin doit être après la heure de début');
        }
      }
    }
  }
});

module.exports = TimeSlot;
