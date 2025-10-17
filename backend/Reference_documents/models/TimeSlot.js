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
    type: DataTypes.STRING, 
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
  ]
});

module.exports = TimeSlot;
