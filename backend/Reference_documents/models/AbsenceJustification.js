const { DataTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');

const AbsenceJustification = sequelize.define('AbsenceJustification', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: () => {
      const crypto = require('crypto');
      return crypto.randomUUID();
    }
  },
  // Reference to student absence
  student_absence_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    comment: 'Reference to StudentAbsence record'
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Student submitting the justification'
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Lesson/session of the absence'
  },
  matiere_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Subject of the course'
  },
  classe_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Class of the student'
  },
  
  // Justification details
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Title of the justification'
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Text explanation from student'
  },
  justification_type: {
    type: DataTypes.ENUM(
      'medical',
      'family_issue',
      'administrative',
      'personal',
      'other'
    ),
    allowNull: false,
    defaultValue: 'other',
    comment: 'Category of justification'
  },
  
  // Document handling
  document_filename: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Original filename of uploaded document'
  },
  document_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path to stored document (PDF, JPG, PNG)'
  },
  document_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'File size in bytes'
  },
  document_mime_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'MIME type of the document'
  },
  document_uploaded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when document was uploaded'
  },
  
  // Status tracking
  status: {
    type: DataTypes.ENUM(
      'pending',           // Waiting for review
      'approved',          // Approved - absence justified
      'rejected',          // Rejected - absence stays unjustified
      'revision_needed',   // Needs more info
      'deleted'            // Student deleted before review
    ),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Current status of justification request'
  },
  
  // Review information
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Admin/Chef who reviewed the justification'
  },
  review_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when justification was reviewed'
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comments/notes from reviewer'
  },
  
  // Revision request tracking
  revision_request_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Message sent to student when revision is needed'
  },
  revision_request_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When revision was requested'
  },
  
  // Submission tracking
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When justification was originally submitted'
  },
  last_modified_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Last update timestamp'
  },
  
  // Notification flags
  student_notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether notification was sent to student'
  },
  admin_notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether notification was sent to admin'
  }
}, {
  schema: 'referentiels',
  tableName: 'absence_justification',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  indexes: [
    {
      fields: ['student_id'],
      name: 'idx_absence_justification_student'
    },
    {
      fields: ['student_absence_id'],
      unique: true,
      name: 'idx_absence_justification_student_absence'
    },
    {
      fields: ['status'],
      name: 'idx_absence_justification_status'
    },
    {
      fields: ['schedule_id'],
      name: 'idx_absence_justification_schedule'
    },
    {
      fields: ['submitted_at'],
      name: 'idx_absence_justification_submitted'
    },
    {
      fields: ['student_id', 'status'],
      name: 'idx_absence_justification_student_status'
    }
  ],
  comment: 'Tracks student absence justification requests with document uploads and approval workflow'
});

module.exports = AbsenceJustification;
