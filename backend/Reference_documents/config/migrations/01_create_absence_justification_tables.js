/**
 * Database Migration Guide for Absence Justification System
 * Run this during initial setup or after deploying the system
 */

// Example migration setup that will run automatically when server starts
// (Sequelize sync handles this, but here's the SQL for reference)

const createAbsenceJustificationMigration = `
-- Create absence_justification table
CREATE TABLE IF NOT EXISTS referentiels.absence_justification (
  id UUID PRIMARY KEY,
  student_absence_id UUID UNIQUE NOT NULL,
  student_id INTEGER NOT NULL,
  schedule_id INTEGER NOT NULL,
  matiere_id INTEGER,
  classe_id INTEGER,
  
  -- Justification Content
  title VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  justification_type ENUM('medical', 'family_issue', 'administrative', 'personal', 'other') DEFAULT 'other',
  
  -- Document Storage
  document_filename VARCHAR(255),
  document_path VARCHAR(500),
  document_size INTEGER,
  document_mime_type VARCHAR(50),
  document_uploaded_at TIMESTAMP NULL,
  
  -- Status & Review
  status ENUM('pending', 'approved', 'rejected', 'revision_needed', 'deleted') DEFAULT 'pending',
  reviewed_by INTEGER NULL,
  review_date TIMESTAMP NULL,
  review_notes TEXT NULL,
  
  -- Revision Request
  revision_request_message TEXT NULL,
  revision_request_date TIMESTAMP NULL,
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Notification Flags
  student_notification_sent BOOLEAN DEFAULT false,
  admin_notification_sent BOOLEAN DEFAULT false,
  
  -- Constraints & Indexes
  CONSTRAINT fk_student_absence FOREIGN KEY (student_absence_id) 
    REFERENCES referentiels.student_absence(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) 
    REFERENCES auth.utilisateur(id) ON DELETE CASCADE,
  CONSTRAINT fk_schedule FOREIGN KEY (schedule_id) 
    REFERENCES referentiels.schedule(id) ON DELETE CASCADE,
  CONSTRAINT fk_matiere FOREIGN KEY (matiere_id) 
    REFERENCES referentiels.matiere(id) ON DELETE SET NULL,
  CONSTRAINT fk_classe FOREIGN KEY (classe_id) 
    REFERENCES referentiels.classe(id) ON DELETE SET NULL,
  
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_schedule (schedule_id),
  INDEX idx_submitted (submitted_at),
  INDEX idx_student_status (student_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create student_elimination table
CREATE TABLE IF NOT EXISTS referentiels.student_elimination (
  id UUID PRIMARY KEY,
  student_id INTEGER NOT NULL,
  matiere_id INTEGER NOT NULL,
  
  reason ENUM('excess_absences', 'academic_performance', 'behavior', 'other') DEFAULT 'excess_absences',
  non_justified_absences INTEGER NULL,
  
  eliminated_by INTEGER NOT NULL,
  eliminated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  can_appeal BOOLEAN DEFAULT true,
  
  -- Appeal Information
  appeal_submitted_at TIMESTAMP NULL,
  appeal_reason TEXT NULL,
  appeal_status ENUM('not_submitted', 'pending', 'approved', 'rejected') DEFAULT 'not_submitted',
  appeal_reviewed_by INTEGER NULL,
  appeal_decision_date TIMESTAMP NULL,
  appeal_notes TEXT NULL,
  
  -- Restoration
  restored_by INTEGER NULL,
  restored_at TIMESTAMP NULL,
  
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT fk_student_elim FOREIGN KEY (student_id) 
    REFERENCES auth.utilisateur(id) ON DELETE CASCADE,
  CONSTRAINT fk_matiere_elim FOREIGN KEY (matiere_id) 
    REFERENCES referentiels.matiere(id) ON DELETE CASCADE,
  CONSTRAINT fk_eliminated_by FOREIGN KEY (eliminated_by) 
    REFERENCES auth.utilisateur(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appeal_reviewed_by FOREIGN KEY (appeal_reviewed_by) 
    REFERENCES auth.utilisateur(id) ON DELETE SET NULL,
  CONSTRAINT fk_restored_by FOREIGN KEY (restored_by) 
    REFERENCES auth.utilisateur(id) ON DELETE SET NULL,
  
  UNIQUE KEY unique_student_matiere (student_id, matiere_id),
  INDEX idx_eliminated_at (eliminated_at),
  INDEX idx_appeal_status (appeal_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update student_absence table to add justification fields
ALTER TABLE referentiels.student_absence
ADD COLUMN IF NOT EXISTS justification_status ENUM('not_submitted', 'pending', 'approved', 'rejected', 'revision_needed') DEFAULT 'not_submitted',
ADD COLUMN IF NOT EXISTS has_active_justification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS matiere_id INTEGER NULL,
ADD COLUMN IF NOT EXISTS classe_id INTEGER NULL,
ADD INDEX idx_justification_status (justification_status),
ADD INDEX idx_matiere_id (matiere_id),
ADD INDEX idx_classe_id (classe_id);
`;

module.exports = {
  /**
   * SQL for manual migration if needed
   */
  sql: createAbsenceJustificationMigration,

  /**
   * Notes for deployment
   */
  deployment: {
    step1: "Tables will be created automatically by Sequelize sync()",
    step2: "Ensure database schema 'referentiels' exists",
    step3: "Ensure auth schema 'auth' exists with utilisateur table",
    step4: "Create /uploads/justifications/ directory with write permissions",
    step5: "Update StudentAbsence indexes if manually running",
    step6: "Run audit log verification if AuditLog table exists",
    step7: "Check that all foreign keys are properly set up"
  },

  /**
   * Verification queries to run after migration
   */
  verification: {
    checkTablesExist: `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'referentiels' 
      AND TABLE_NAME IN ('absence_justification', 'student_elimination', 'student_absence')
      ORDER BY TABLE_NAME;
    `,
    
    checkForeignKeys: `
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'referentiels'
      AND TABLE_NAME IN ('absence_justification', 'student_elimination')
      ORDER BY TABLE_NAME, CONSTRAINT_NAME;
    `,
    
    checkIndexes: `
      SELECT 
        INDEX_NAME,
        TABLE_NAME,
        COLUMN_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = 'referentiels'
      AND TABLE_NAME IN ('absence_justification', 'student_elimination')
      ORDER BY TABLE_NAME, INDEX_NAME;
    `
  },

  /**
   * Sample test data for development
   */
  sampleData: {
    testStudentId: 1,
    testAdminId: 999,
    testClasseId: 1,
    testMatiereId: 1,
    testScheduleId: 1,

    // Sample justification (after StudentAbsence exists)
    sampleJustification: `
      INSERT INTO referentiels.absence_justification (
        id, student_absence_id, student_id, schedule_id, matiere_id, classe_id,
        title, explanation, justification_type, document_filename,
        status, submitted_at
      ) VALUES (
        UUID(), 
        (SELECT id FROM referentiels.student_absence LIMIT 1),
        1,
        1,
        1,
        1,
        'Medical Appointment',
        'Had a dental appointment that could not be rescheduled',
        'medical',
        'medical_cert_2024.pdf',
        'pending',
        NOW()
      );
    `
  },

  /**
   * Rollback instructions if needed
   */
  rollback: {
    step1: "DROP TABLE IF EXISTS referentiels.student_elimination;",
    step2: "DROP TABLE IF EXISTS referentiels.absence_justification;",
    step3: "ALTER TABLE referentiels.student_absence DROP COLUMN IF EXISTS justification_status;",
    step4: "ALTER TABLE referentiels.student_absence DROP COLUMN IF EXISTS has_active_justification;",
    step5: "ALTER TABLE referentiels.student_absence DROP COLUMN IF EXISTS matiere_id;",
    step6: "ALTER TABLE referentiels.student_absence DROP COLUMN IF EXISTS classe_id;",
    step7: "Remove /uploads/justifications/ directory"
  },

  /**
   * Optimization queries to run periodically
   */
  optimization: {
    analyzeTables: `
      ANALYZE TABLE referentiels.absence_justification;
      ANALYZE TABLE referentiels.student_elimination;
    `,
    
    optimizeTables: `
      OPTIMIZE TABLE referentiels.absence_justification;
      OPTIMIZE TABLE referentiels.student_elimination;
    `,
    
    rebuildIndexes: `
      REPAIR TABLE referentiels.absence_justification;
      REPAIR TABLE referentiels.student_elimination;
    `
  },

  /**
   * Maintenance queries
   */
  maintenance: {
    // Archive old justifications (older than 1 year)
    archiveOldJustifications: `
      -- Create archive backup (optional)
      INSERT INTO referentiels.absence_justification_archive
      SELECT * FROM referentiels.absence_justification
      WHERE submitted_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
      
      -- Delete archived records
      DELETE FROM referentiels.absence_justification
      WHERE submitted_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    `,

    // Cleanup deleted justifications after 30 days
    cleanupDeletedJustifications: `
      DELETE FROM referentiels.absence_justification
      WHERE status = 'deleted'
      AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    `,

    // Check for orphaned records
    findOrphanedJustifications: `
      SELECT aj.id, aj.student_absence_id
      FROM referentiels.absence_justification aj
      LEFT JOIN referentiels.student_absence sa ON aj.student_absence_id = sa.id
      WHERE sa.id IS NULL;
    `,

    // Generate usage statistics
    justificationStatistics: `
      SELECT
        DATE(aj.submitted_at) as date,
        aj.status,
        COUNT(*) as count,
        AVG(DATEDIFF(aj.review_date, aj.submitted_at)) as avg_review_days
      FROM referentiels.absence_justification aj
      GROUP BY DATE(aj.submitted_at), aj.status
      ORDER BY date DESC, status;
    `,

    // Monitor elimination trends
    eliminationStatistics: `
      SELECT
        m.nom as matiere,
        COUNT(DISTINCT se.student_id) as eliminated_count,
        AVG(se.non_justified_absences) as avg_absences,
        SUM(CASE WHEN se.appeal_status = 'approved' THEN 1 ELSE 0 END) as appeals_approved,
        SUM(CASE WHEN se.appeal_status = 'rejected' THEN 1 ELSE 0 END) as appeals_rejected
      FROM referentiels.student_elimination se
      LEFT JOIN referentiels.matiere m ON se.matiere_id = m.id
      GROUP BY m.id, m.nom
      ORDER BY eliminated_count DESC;
    `
  },

  /**
   * Performance tips
   */
  performanceTips: [
    "Add indexes on frequently queried columns (already done)",
    "Partition tables by year for large datasets: PARTITION BY YEAR(submitted_at)",
    "Archive old justifications to separate table yearly",
    "Use database statistics for query optimization: ANALYZE TABLE",
    "Monitor slow queries: SET GLOBAL slow_query_log = 'ON'",
    "Use connection pooling in Node.js",
    "Cache frequently accessed data (admin statistics)",
    "Paginate results when fetching large datasets",
    "Use database transactions for multi-step operations"
  ]
};
