const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const departement = sequelize.define('departement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  code: { type: DataTypes.STRING(10), allowNull: true, unique: true },
  chef_departement_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: { tableName: 'utilisateur', schema: 'auth' }, key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  budget: { type: DataTypes.DECIMAL(15, 2), allowNull: true, defaultValue: 0.00 },
  statut: { type: DataTypes.ENUM('actif', 'inactif', 'suspendu'), allowNull: true, defaultValue: 'actif' },
  localisation: { type: DataTypes.STRING(255), allowNull: true },
  telephone: { type: DataTypes.STRING(20), allowNull: true },
  email: { type: DataTypes.STRING(255), allowNull: true, validate: { isEmail: true } },
  capacite_max: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 50, validate: { min: 1 } },
  date_creation: { type: DataTypes.DATE, allowNull: true, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
}, {
  schema: "referentiels",
  tableName: "departement",
  timestamps: true
});

// Relationships are defined in models/index.js to avoid circular dependencies

module.exports = departement;
