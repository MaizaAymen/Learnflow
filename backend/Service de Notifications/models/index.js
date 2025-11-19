const Notification = require('./Notification');
const NotificationPreference = require('./NotificationPreference');
const NotificationLog = require('./NotificationLog');
const sequelize = require('../config');

// Define relationships
Notification.hasMany(NotificationLog, {
  foreignKey: 'notification_id',
  as: 'logs'
});

NotificationLog.belongsTo(Notification, {
  foreignKey: 'notification_id',
  as: 'notification'
});

module.exports = {
  Notification,
  NotificationPreference,
  NotificationLog,
  sequelize
};
