const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HelpDeskMessage = sequelize.define('HelpDeskMessage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    typeAuteur: {
      type: DataTypes.ENUM('student', 'support', 'admin'),
      defaultValue: 'student',
    },
    dateMessage: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'help_desk_messages',
    schema: 'auth',
    timestamps: false,
  });

  return HelpDeskMessage;
};
