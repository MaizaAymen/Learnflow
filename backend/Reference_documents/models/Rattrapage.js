const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const Rattrapage = sequelize.define('Rattrapage', {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true
    },
    original_schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'schedule',
        key: 'id'
      },
      comment: 'The session being rescheduled'
    },
    enseignant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
      // NOTE: Don't specify references here - relationship will be defined in index.js
      // to allow cross-schema FK (referentiels.rattrapage -> auth.utilisateur)
    },
    requested_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Proposed date for rattrapage'
    },
    requested_start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    requested_end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    motif: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Reason for rattrapage'
    },
    statut: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending'
    },
    validated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
      // NOTE: Don't specify references here - relationship will be defined in index.js
    },
    validation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    new_schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'schedule',
        key: 'id'
      },
      comment: 'The new schedule created after approval'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    schema: 'referentiels',
    timestamps: true,
    underscored: true
  });

module.exports = Rattrapage;
