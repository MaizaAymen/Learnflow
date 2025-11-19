const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const EventRegistration = sequelize.define('EventRegistration', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('registered', 'attended', 'cancelled'), allowNull: false, defaultValue: 'registered' },
  registered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  schema: 'referentiels',
  tableName: 'event_registration',
  timestamps: true,
  indexes: [
    { fields: ['event_id', 'student_id'], unique: true }
  ]
});

module.exports = EventRegistration;
