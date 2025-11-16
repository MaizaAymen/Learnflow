const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');

const Student = sequelize.define('student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  numero_etudiant: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique student ID number'
  },
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  niveau_id: {
    type: DataTypes.INTEGER,
    allowNull: true
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via relationships
    ,
    comment: 'Associated academic level'
  },
  classe_id: {
    type: DataTypes.INTEGER,
    allowNull: true
    // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
    // FK constraint will be added via relationships
    ,
    comment: 'Assigned class/group'
  },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif', 'diplome', 'abandonne'),
    defaultValue: 'actif',
    allowNull: false
  },
  is_temporary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if student was added during import but not yet committed'
  },
  import_batch_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Batch ID for tracking imports'
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  schema: 'referentiels',
  tableName: 'student',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['numero_etudiant']
    },
    {
      fields: ['classe_id']
    },
    {
      fields: ['niveau_id']
    },
    {
      fields: ['import_batch_id']
    }
  ]
});

module.exports = Student;
