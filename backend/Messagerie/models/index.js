const Message = require('./Message');
const Conversation = require('./Conversation');
const ConversationParticipant = require('./ConversationParticipant');
const UserOnlineStatus = require('./UserOnlineStatus');
const sequelize = require('../../auth-service/config');

module.exports = {
  Message,
  Conversation,
  ConversationParticipant,
  UserOnlineStatus,
  sequelize
};
