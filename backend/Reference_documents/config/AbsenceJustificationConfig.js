/**
 * Absence Justification System Configuration
 * Central place for all system settings and constants
 */

module.exports = {
  // ============================================================================
  // FILE UPLOAD SETTINGS
  // ============================================================================
  upload: {
    allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    uploadDir: '/uploads/justifications/',
    description: 'PDF, JPG, PNG files up to 10MB'
  },

  // ============================================================================
  // JUSTIFICATION STATUS VALUES
  // ============================================================================
  justificationStatus: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    REVISION_NEEDED: 'revision_needed',
    DELETED: 'deleted'
  },

  // ============================================================================
  // JUSTIFICATION TYPES
  // ============================================================================
  justificationType: {
    MEDICAL: 'medical',
    FAMILY_ISSUE: 'family_issue',
    ADMINISTRATIVE: 'administrative',
    PERSONAL: 'personal',
    OTHER: 'other'
  },

  justificationTypeLabels: {
    medical: 'Médical',
    family_issue: 'Problème Familial',
    administrative: 'Administratif',
    personal: 'Personnel',
    other: 'Autre'
  },

  // ============================================================================
  // ABSENCE & ELIMINATION SETTINGS
  // ============================================================================
  elimination: {
    // Default limit of non-justified absences before elimination
    defaultLimit: 3,
    
    // Minimum absences required to trigger elimination
    minAbsencesForElimination: 3,

    // Whether students can appeal eliminations
    allowAppeal: true,

    // Reasons for elimination
    reasons: {
      EXCESS_ABSENCES: 'excess_absences',
      ACADEMIC_PERFORMANCE: 'academic_performance',
      BEHAVIOR: 'behavior',
      OTHER: 'other'
    }
  },

  // ============================================================================
  // ELIMINATION STATUS
  // ============================================================================
  eliminationStatus: {
    NOT_SUBMITTED: 'not_submitted',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  // ============================================================================
  // NOTIFICATION SETTINGS
  // ============================================================================
  notifications: {
    // Notification types
    types: {
      JUSTIFICATION_SUBMITTED: 'justification_submitted',
      JUSTIFICATION_APPROVED: 'justification_approved',
      JUSTIFICATION_REJECTED: 'justification_rejected',
      REVISION_NEEDED: 'revision_needed',
      STUDENT_ELIMINATED: 'student_eliminated',
      APPEAL_APPROVED: 'appeal_approved',
      APPEAL_REJECTED: 'appeal_rejected',
      NEW_SUBMISSION_ADMIN: 'new_submission_admin',
      DAILY_STATS: 'daily_stats'
    },

    // Message templates (French)
    templates: {
      SUBMITTED: 'Votre justification d\'absence est en attente de révision.',
      APPROVED: 'Votre justification a été approuvée. L\'absence n\'est pas comptabilisée.',
      REJECTED: 'Votre justification a été rejetée. L\'absence reste non justifiée.',
      REVISION_NEEDED: 'Plus d\'informations sont nécessaires.',
      ELIMINATED: 'Vous avez été éliminé du cours.',
      APPEAL_APPROVED: 'Votre recours a été approuvé.',
      APPEAL_REJECTED: 'Votre recours a été rejeté.'
    },

    // Priority levels
    priorities: {
      LOW: 'low',
      NORMAL: 'normal',
      HIGH: 'high',
      URGENT: 'urgent'
    }
  },

  // ============================================================================
  // ROLE-BASED PERMISSIONS
  // ============================================================================
  roles: {
    STUDENT: 'etudiant',
    TEACHER: 'enseignant',
    ADMIN: 'admin',
    DEPARTMENT_HEAD: 'department_head',
    CHEF_DEPARTEMENT: 'chef_departement',
    SUPER_ADMIN: 'super_admin'
  },

  // Who can perform which actions
  permissions: {
    submitJustification: ['etudiant'],
    viewOwnJustifications: ['etudiant'],
    updateOwnJustification: ['etudiant'],
    deleteOwnJustification: ['etudiant'],
    downloadOwnDocument: ['etudiant'],

    viewAllJustifications: ['admin', 'department_head', 'chef_departement'],
    approveJustification: ['admin', 'department_head'],
    rejectJustification: ['admin', 'department_head'],
    requestRevision: ['admin', 'department_head'],
    viewStatistics: ['admin', 'department_head'],
    
    overrideDecision: ['chef_departement', 'super_admin'],
    restoreStudent: ['chef_departement', 'super_admin'],
    changeEliminationRules: ['chef_departement', 'super_admin'],
    
    viewAbsences: ['enseignant', 'admin', 'chef_departement'],
    submitAppeal: ['etudiant']
  },

  // ============================================================================
  // PAGINATION DEFAULTS
  // ============================================================================
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
  },

  // ============================================================================
  // API RESPONSE MESSAGES
  // ============================================================================
  messages: {
    // Success
    justificationSubmitted: 'Justification submitted successfully',
    justificationUpdated: 'Justification updated successfully',
    justificationDeleted: 'Justification deleted successfully',
    justificationApproved: 'Justification approved successfully',
    justificationRejected: 'Justification rejected successfully',
    revisionRequested: 'Revision requested successfully',

    // Errors
    notFound: 'Record not found',
    unauthorized: 'Unauthorized',
    forbidden: 'You do not have permission to perform this action',
    invalidType: 'Invalid justification type',
    invalidStatus: 'Invalid status',
    fileRequired: 'Document file is required',
    fileTooLarge: 'File size exceeds maximum allowed',
    invalidFileType: 'Invalid file type. Allowed: PDF, JPG, PNG',
    studentNotFound: 'Student not found',
    absenceNotFound: 'Absence record not found',
    alreadyExists: 'A justification already exists for this absence',
    cannotModify: 'Cannot modify justification with this status',
    eliminationNotFound: 'Elimination record not found'
  },

  // ============================================================================
  // AUDIT LOG ACTIONS
  // ============================================================================
  auditActions: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    REQUEST_REVISION: 'REQUEST_REVISION',
    OVERRIDE: 'OVERRIDE',
    ELIMINATE: 'ELIMINATE',
    APPEAL: 'APPEAL',
    RESTORE: 'RESTORE',
    DOWNLOAD: 'DOWNLOAD'
  },

  // ============================================================================
  // DOCUMENT STORAGE PATHS
  // ============================================================================
  paths: {
    justifications: '/uploads/justifications/',
    backups: '/backups/justifications/',
    archives: '/archives/justifications/'
  },

  // ============================================================================
  // EMAIL SETTINGS (For notification service integration)
  // ============================================================================
  email: {
    // Email templates to create
    templates: {
      JUSTIFICATION_SUBMITTED: 'justification_submitted',
      JUSTIFICATION_APPROVED: 'justification_approved',
      JUSTIFICATION_REJECTED: 'justification_rejected',
      REVISION_NEEDED: 'revision_needed',
      ELIMINATION_NOTICE: 'elimination_notice'
    },

    // Email addresses to notify
    adminEmail: process.env.ADMIN_EMAIL || 'admin@learnflow.local',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@learnflow.local',
    
    // SMTP settings
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },

  // ============================================================================
  // SCHEDULING (Cron jobs)
  // ============================================================================
  scheduling: {
    // Send daily statistics report at 09:00
    dailyStatsTime: '0 9 * * *',

    // Check for overdue revisions (7 days)
    revisionCheckTime: '0 12 * * *',
    revisionOverdueDays: 7,

    // Archive old justifications (1 year)
    archiveTime: '0 2 1 * *',
    archiveAfterDays: 365
  },

  // ============================================================================
  // VALIDATION RULES
  // ============================================================================
  validation: {
    title: {
      minLength: 3,
      maxLength: 255
    },
    explanation: {
      minLength: 10,
      maxLength: 5000
    },
    revisionMessage: {
      minLength: 10,
      maxLength: 1000
    },
    reviewNotes: {
      minLength: 5,
      maxLength: 2000
    }
  },

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================
  features: {
    // Enable/disable features
    enableJustifications: true,
    enableDocumentUpload: true,
    enableElimination: true,
    enableAppeal: true,
    enableEmailNotifications: false, // Set to true after configuring email
    enableSmsNotifications: false,   // Set to true after configuring SMS
    enableWebSocketNotifications: false, // Set to true after configuring WebSocket
    
    // Admin features
    enableManualElimination: true,
    enableOverride: true,
    enableAppealReview: true,
    enableStatistics: true
  },

  // ============================================================================
  // LOGGING & DEBUGGING
  // ============================================================================
  logging: {
    // Log levels: error, warn, info, debug
    level: process.env.LOG_LEVEL || 'info',
    
    // Log file settings
    files: {
      error: '/logs/error.log',
      access: '/logs/access.log',
      audit: '/logs/audit.log'
    }
  },

  // ============================================================================
  // TESTING SETTINGS
  // ============================================================================
  testing: {
    // Use test database for tests
    useTestDb: process.env.NODE_ENV === 'test',
    
    // Test user IDs
    testStudentId: 1,
    testAdminId: 999,
    
    // Mock notification service (no actual emails/SMS)
    mockNotifications: process.env.NODE_ENV === 'test'
  }
};

/**
 * Get configuration by key with dot notation
 * Example: getConfig('email.smtp.host')
 */
function getConfig(key) {
  const keys = key.split('.');
  let value = module.exports;
  
  for (const k of keys) {
    if (value[k] === undefined) {
      return undefined;
    }
    value = value[k];
  }
  
  return value;
}

module.exports.getConfig = getConfig;
