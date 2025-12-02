const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { 
    type: DataTypes.ENUM(
      'fermeture', 'conference', 'journee_scientifique', 'seminaire', 'examen_exceptionnel', 'reunion_pedagogique', 'rattrapage_global', 'annonce_departementale'
    ),
    allowNull: false
  },
  visibility: { type: DataTypes.ENUM('public','department','private'), allowNull: false, defaultValue: 'public' },
  description: { type: DataTypes.TEXT, allowNull: true },
  start_date: { type: DataTypes.DATE, allowNull: false },
  end_date: { type: DataTypes.DATE, allowNull: true },
  is_all_day: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  departement_id: { type: DataTypes.INTEGER, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: true },
  pdf_path: { type: DataTypes.STRING, allowNull: true },
  pdf_filename: { type: DataTypes.STRING, allowNull: true }
}, {
  schema: 'referentiels',
  tableName: 'evenement',
  timestamps: true
});

module.exports = Event;
