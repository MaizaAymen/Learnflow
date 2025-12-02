const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const StudentElimination = sequelize.define('StudentElimination', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => {
      const crypto = require('crypto');
      return crypto.randomUUID();
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Student being eliminated'
  },
  matiere_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Subject/Course where student is eliminated'
  },
  reason: {
    type: DataTypes.ENUM(
      'excess_absences',
      'academic_performance',
      'behavior',
      'other'
    ),
    defaultValue: 'excess_absences',
    comment: 'Reason for elimination'
  },
  non_justified_absences: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of non-justified absences (if reason is excess_absences)'
  },
  eliminated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Admin/Chef who made the elimination decision'
  },
  eliminated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When elimination took effect'
  },
  
  // Appeal information
  can_appeal: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether student can appeal this elimination'
  },
  appeal_submitted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When student submitted appeal'
  },
  appeal_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Student\'s reason for appealing'
  },
  appeal_status: {
    type: DataTypes.ENUM(
      'not_submitted',
      'pending',
      'approved',
      'rejected'
    ),
    defaultValue: 'not_submitted',
    comment: 'Status of the appeal'
  },
  appeal_reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Admin who reviewed the appeal'
  },
  appeal_decision_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When appeal was decided'
  },
  appeal_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from the appeal review'
  },
  
  // Restoration info (if appealed and approved)
  restored_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Admin who restored student if appeal approved'
  },
  restored_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When student was restored (if applicable)'
  },
  
  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about the elimination'
  }
}, {
  schema: 'referentiels',
  tableName: 'student_elimination',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  indexes: [
    {
      fields: ['student_id'],
      name: 'idx_student_elimination_student'
    },
    {
      fields: ['matiere_id'],
      name: 'idx_student_elimination_matiere'
    },
    {
      fields: ['student_id', 'matiere_id'],
      unique: true,
      name: 'idx_student_elimination_unique'
    },
    {
      fields: ['eliminated_at'],
      name: 'idx_student_elimination_date'
    },
    {
      fields: ['appeal_status'],
      name: 'idx_student_elimination_appeal'
    }
  ],
  comment: 'Tracks student eliminations from courses due to excess absences or other reasons'
});

module.exports = StudentElimination;
