const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const Booking = sequelize.define('Booking', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  schedule_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  user_type: { 
    type: DataTypes.ENUM('student', 'teacher', 'observer'), 
    allowNull: false
  },
  booking_date: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  statut: { 
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'), 
    defaultValue: 'pending'
  },
  presence: { 
    type: DataTypes.BOOLEAN, 
    allowNull: true,
    defaultValue: null,
    comment: 'Marked during or after the class'
  },
  notes: { 
    type: DataTypes.TEXT, 
    allowNull: true
  },
  heure_arrivee: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Actual arrival time for attendance tracking'
  }
}, {
  schema: "referentiels",
  tableName: "booking",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['schedule_id', 'user_id'],
      name: 'unique_booking_per_user_per_schedule'
    }
  ]
});

// Relationships are defined in models/index.js to avoid circular dependencies

module.exports = Booking;
