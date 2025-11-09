const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');
const User = require('../../auth-service/models/userModel');
const Matiere = require('./Matiére');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  documentUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER, // Order of the course in the matiere
    allowNull: true,
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  matiereId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'matiere',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  schema: 'referentiels',
  tableName: 'courses',
  timestamps: true
});

// Define relationships
Course.belongsTo(Matiere, { foreignKey: 'matiereId', as: 'matiere' });
Matiere.hasMany(Course, { foreignKey: 'matiereId', as: 'courses' });

Course.belongsTo(User, { foreignKey: 'userId', as: 'enseignant' });
User.hasMany(Course, { foreignKey: 'userId', as: 'courses' });

module.exports = Course;
