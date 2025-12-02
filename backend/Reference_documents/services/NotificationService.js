/**
 * Notifications Service
 * Handles sending notifications for absence justifications
 */

const { v4: uuidv4 } = require('uuid');

class NotificationService {
  constructor(models) {
    this.models = models;
  }

  /**
   * Send notification for submitted justification
   * @param {Object} justification - The justification record
   * @param {Object} student - Student who submitted
   */
  async notifyAdminNewJustification(justification, student) {
    try {
      const message = {
        id: uuidv4(),
        type: 'absence_justification_submitted',
        title: '📝 New Justification Submitted',
        message: `${student.prenom} ${student.nom} has submitted a justification for an absence.`,
        details: {
          justificationId: justification.id,
          studentName: `${student.prenom} ${student.nom}`,
          studentId: student.id,
          justificationType: justification.justification_type,
          hasDocument: !!justification.document_path,
          submittedAt: justification.submitted_at
        },
        targetRole: ['admin', 'department_head', 'chef_departement'],
        status: 'unread',
        createdAt: new Date(),
        actionUrl: `/admin/justifications/${justification.id}`
      };

      // TODO: Save to Notification table or emit via WebSocket
      console.log('📧 Admin Notification:', message);
      return message;
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }

  /**
   * Send notification - Justification submitted (to student)
   * @param {Object} justification - The justification record
   * @param {Object} student - Student who submitted
   */
  async notifyStudentSubmitted(justification, student) {
    try {
      const message = {
        id: uuidv4(),
        type: 'justification_submitted',
        title: '✅ Justification Submitted',
        message: 'Votre justification d\'absence est en attente de révision.',
        details: {
          justificationId: justification.id,
          status: justification.status,
          submittedAt: justification.submitted_at
        },
        targetUserId: student.id,
        status: 'unread',
        createdAt: new Date(),
        actionUrl: `/absences/justifications/${justification.id}`
      };

      console.log('📧 Student Notification (Submitted):', message);
      return message;
    } catch (error) {
      console.error('Error sending student notification:', error);
    }
  }

  /**
   * Send notification - Justification approved
   * @param {Object} justification - The justification record
   * @param {Object} student - Student who submitted
   */
  async notifyStudentApproved(justification, student) {
    try {
      const message = {
        id: uuidv4(),
        type: 'justification_approved',
        title: '✔ Justification Approved',
        message: 'Votre justification d\'absence a été approuvée. L\'absence n\'est plus comptabilisée.',
        details: {
          justificationId: justification.id,
          status: 'approved',
          approvedAt: justification.review_date,
          notes: justification.review_notes
        },
        targetUserId: student.id,
        status: 'unread',
        createdAt: new Date(),
        actionUrl: `/absences/justifications/${justification.id}`,
        importance: 'high'
      };

      console.log('📧 Student Notification (Approved):', message);
      return message;
    } catch (error) {
      console.error('Error sending student notification:', error);
    }
  }

  /**
   * Send notification - Justification rejected
   * @param {Object} justification - The justification record
   * @param {Object} student - Student who submitted
   */
  async notifyStudentRejected(justification, student) {
    try {
      const message = {
        id: uuidv4(),
        type: 'justification_rejected',
        title: '❌ Justification Rejected',
        message: 'Votre justification d\'absence a été rejetée. L\'absence reste non justifiée.',
        details: {
          justificationId: justification.id,
          status: 'rejected',
          reason: justification.review_notes,
          rejectedAt: justification.review_date
        },
        targetUserId: student.id,
        status: 'unread',
        createdAt: new Date(),
        actionUrl: `/absences/justifications/${justification.id}`,
        importance: 'high'
      };

      console.log('📧 Student Notification (Rejected):', message);
      return message;
    } catch (error) {
      console.error('Error sending student notification:', error);
    }
  }

  /**
   * Send notification - Revision needed
   * @param {Object} justification - The justification record
   * @param {Object} student - Student who submitted
   */
  async notifyStudentRevisionNeeded(justification, student) {
    try {
      const message = {
        id: uuidv4(),
        type: 'justification_revision_needed',
        title: '❓ More Information Needed',
        message: justification.revision_request_message || 
                'Plus d\'informations sont nécessaires pour traiter votre justification.',
        details: {
          justificationId: justification.id,
          status: 'revision_needed',
          requestedAt: justification.revision_request_date,
          message: justification.revision_request_message
        },
        targetUserId: student.id,
        status: 'unread',
        createdAt: new Date(),
        actionUrl: `/absences/justifications/${justification.id}`,
        importance: 'high'
      };

      console.log('📧 Student Notification (Revision Needed):', message);
      return message;
    } catch (error) {
      console.error('Error sending student notification:', error);
    }
  }

  /**
   * Send notification - Decision overridden
   * @param {Object} justification - The justification record
   * @param {Object} student - Student affected
   * @param {String} newStatus - New status (approved/rejected)
   * @param {String} overriddenBy - Role of person overriding
   */
  async notifyStudentDecisionOverridden(justification, student, newStatus, overriddenBy) {
    try {
      const message = {
        id: uuidv4(),
        type: 'justification_decision_overridden',
        title: newStatus === 'approved' ? '✔ Decision Updated' : '❌ Decision Updated',
        message: newStatus === 'approved' ? 
                'La décision précédente a été modifiée. Votre justification est maintenant approuvée.' :
                'La décision précédente a été modifiée. Votre justification reste rejetée.',
        details: {
          justificationId: justification.id,
          oldStatus: 'pending',
          newStatus,
          overriddenBy,
          overriddenAt: new Date()
        },
        targetUserId: student.id,
        status: 'unread',
        createdAt: new Date(),
        actionUrl: `/absences/justifications/${justification.id}`,
        importance: 'high'
      };

      console.log('📧 Student Notification (Decision Overridden):', message);
      return message;
    } catch (error) {
      console.error('Error sending student notification:', error);
    }
  }

  /**
   * Notify teacher about student elimination
   * @param {Object} student - Student being eliminated
   * @param {Object} matiere - Subject/Course
   * @param {Number} absenceCount - Number of non-justified absences
   * @param {Number} limit - Limit threshold
   */
  async notifyTeacherStudentEliminated(student, matiere, absenceCount, limit) {
    try {
      const message = {
        id: uuidv4(),
        type: 'student_eliminated',
        title: '⚠️ Student Eliminated',
        message: `${student.prenom} ${student.nom} has been eliminated from this course due to excessive absences.`,
        details: {
          studentName: `${student.prenom} ${student.nom}`,
          studentId: student.id,
          matiere: matiere.nom,
          matiereId: matiere.id,
          absenceCount,
          limit,
          eliminatedAt: new Date()
        },
        targetRole: ['enseignant', 'admin'],
        targetMatiereId: matiere.id,
        status: 'unread',
        createdAt: new Date(),
        importance: 'high'
      };

      console.log('📧 Teacher Notification (Elimination):', message);
      return message;
    } catch (error) {
      console.error('Error sending teacher notification:', error);
    }
  }

  /**
   * Bulk notification for statistics
   * @param {Object} stats - Statistics object
   */
  async notifyAdminDailyStats(stats) {
    try {
      const message = {
        id: uuidv4(),
        type: 'daily_justification_stats',
        title: '📊 Daily Justification Report',
        message: `Daily summary of absence justifications`,
        details: stats,
        targetRole: ['admin', 'department_head'],
        status: 'unread',
        createdAt: new Date()
      };

      console.log('📧 Admin Notification (Daily Stats):', message);
      return message;
    } catch (error) {
      console.error('Error sending stats notification:', error);
    }
  }
}

module.exports = NotificationService;
