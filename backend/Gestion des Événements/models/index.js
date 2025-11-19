const Event = require('./Event');
const EventRegistration = require('./EventRegistration');
const sequelize = require('../../auth-service/config');

// Relationships
Event.hasMany(EventRegistration, {
  foreignKey: 'event_id',
  as: 'registrations',
  onDelete: 'CASCADE'
});

EventRegistration.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

module.exports = {
  Event,
  EventRegistration,
  sequelize
};
