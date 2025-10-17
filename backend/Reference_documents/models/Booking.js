const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');
const Schedule = require('./Schedule');

const Booking = sequelize.define('Booking', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  schedule_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: Schedule,
      key: 'id'
    }
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false
  },
  user_type: { 
    type: DataTypes.ENUM('student', 'teacher'), 
    allowNull: false
  },
  booking_date: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  statut: { 
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'), 
    defaultValue: 'pending'
  },
  presence: { 
    type: DataTypes.BOOLEAN, 
    allowNull: true
  },
  notes: { 
    type: DataTypes.TEXT, 
    allowNull: true
  }
}, {
  schema: "referentiels",
  tableName: "booking",
  timestamps: true
});

// Relations
Schedule.hasMany(Booking, { foreignKey: 'schedule_id', as: 'bookings' });
Booking.belongsTo(Schedule, { foreignKey: 'schedule_id', as: 'schedule' });

module.exports = Booking;
