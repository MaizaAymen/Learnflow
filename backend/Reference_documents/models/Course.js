const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
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
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  documentUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes',
    validate: {
      min: 0,
      max: 600 // Max 10 hours
    }
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Order of the course/lesson within the matiere',
    validate: {
      min: 0
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  matiereId: {
    type: DataTypes.INTEGER,
    allowNull: false
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via belongsTo() relationship and models/index.js
  },
  type_contenu: {
    type: DataTypes.ENUM('video', 'document', 'mixte', 'presentation', 'quiz'),
    defaultValue: 'document'
  }
}, {
  schema: 'referentiels',
  tableName: 'courses',
  timestamps: true
});

// Relationships are defined in models/index.js to avoid circular dependencies

module.exports = Course;
