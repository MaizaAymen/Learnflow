const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const Absence = sequelize.define('Absence', {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'schedule',
        key: 'id'
      }
    },
    enseignant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
      // NOTE: Don't specify references here - relationship will be defined in index.js
      // to allow cross-schema FK (referentiels.absence -> auth.utilisateur)
    },
    motif: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Reason for absence'
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    statut: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    schema: 'referentiels',
    timestamps: true,
    underscored: true
  });

module.exports = Absence;
