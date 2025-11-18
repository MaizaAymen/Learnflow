const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const StudentAbsence = sequelize.define('StudentAbsence', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => {
      const crypto = require('crypto');
      return crypto.randomUUID();
    }
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to the lesson/session'
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to the student'
  },
  enseignant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Teacher who marked the absence'
  },
  absence_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'absent',
    validate: {
      isIn: [['present', 'absent', 'excused', 'late', 'left_early']]
    },
    comment: 'Type of absence or attendance status'
  },
  motif: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Reason for absence if excused'
  },
  marked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp when absence was marked'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about the absence'
  },
  statut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected']]
    },
    comment: 'Status of the absence record (pending approval)'
  }
}, {
  schema: 'referentiels',
  tableName: 'student_absence',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  indexes: [
    {
      fields: ['schedule_id', 'student_id'],
      unique: true,
      name: 'unique_student_per_schedule'
    },
    {
      fields: ['schedule_id']
    },
    {
      fields: ['student_id']
    },
    {
      fields: ['enseignant_id']
    }
  ]
});

module.exports = StudentAbsence;
