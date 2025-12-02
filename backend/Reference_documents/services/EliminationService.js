/**
 * Absence Elimination Logic Service
 * Handles automatic elimination when absence limits are exceeded
 */

const { v4: uuidv4 } = require('uuid');

class EliminationService {
  constructor(models, logAudit) {
    this.models = models;
    this.logAudit = logAudit;
  }

  /**
   * Check if student should be eliminated based on non-justified absences
   * @param {Integer} studentId - Student ID
   * @param {Integer} matiereId - Subject/Matière ID
   * @param {Integer} limit - Limit of non-justified absences (default: 3)
   * @returns {Object} Elimination status and details
   */
  async checkEliminationStatus(studentId, matiereId, limit = 3) {
    try {
      const { StudentAbsence, AbsenceJustification } = this.models;

      // Find all non-justified absences for this student in this matière
      const nonJustifiedAbsences = await StudentAbsence.findAll({
        where: {
          student_id: studentId,
          matiere_id: matiereId,
          absence_type: 'absent'
          // Note: Need to check justification status via AbsenceJustification
        },
        include: [
          {
            model: AbsenceJustification,
            required: false,
            where: { status: 'approved' }
          }
        ]
      });

      // Count only truly non-justified absences
      // (those without an approved justification)
      const nonJustifiedCount = nonJustifiedAbsences.filter(
        absence => !absence.AbsenceJustifications || absence.AbsenceJustifications.length === 0
      ).length;

      const isEliminated = nonJustifiedCount >= limit;

      return {
        studentId,
        matiereId,
        nonJustifiedCount,
        limit,
        isEliminated,
        canJustifyMore: !isEliminated,
        remainingBefore: Math.max(0, limit - nonJustifiedCount)
      };
    } catch (error) {
      console.error('Error checking elimination status:', error);
      throw error;
    }
  }

  /**
   * Mark student as eliminated from a course
   * @param {Integer} studentId - Student ID
   * @param {Integer} matiereId - Subject/Matière ID
   * @param {Integer} nonJustifiedCount - Number of non-justified absences
   * @param {Integer} userId - Admin user ID making the decision
   */
  async eliminateStudent(studentId, matiereId, nonJustifiedCount, userId) {
    try {
      const { StudentElimination } = this.models;

      // Create elimination record
      const elimination = await StudentElimination.create({
        id: uuidv4(),
        student_id: studentId,
        matiere_id: matiereId,
        reason: 'excess_absences',
        non_justified_absences: nonJustifiedCount,
        eliminated_by: userId,
        eliminated_at: new Date(),
        can_appeal: true
      });

      // Log the action
      await this.logAudit({
        userId,
        action: 'ELIMINATE',
        entityType: 'student_elimination',
        entityId: elimination.id,
        description: `Student ${studentId} eliminated from matière ${matiereId} due to ${nonJustifiedCount} non-justified absences`,
        newValues: elimination.toJSON()
      });

      return elimination;
    } catch (error) {
      console.error('Error eliminating student:', error);
      throw error;
    }
  }

  /**
   * Get elimination status for student in all courses
   * @param {Integer} studentId - Student ID
   * @returns {Array} List of eliminations
   */
  async getStudentEliminations(studentId) {
    try {
      const { StudentElimination } = this.models;

      const eliminations = await StudentElimination.findAll({
        where: { student_id: studentId },
        include: [
          {
            model: require('../models/Matiere'),
            attributes: ['id', 'nom'],
            required: false
          }
        ]
      });

      return eliminations;
    } catch (error) {
      console.error('Error fetching eliminations:', error);
      throw error;
    }
  }

  /**
   * Check if student can justify more absences
   * @param {Integer} studentId - Student ID
   * @param {Integer} matiereId - Subject/Matière ID
   * @returns {Boolean} Whether student can submit more justifications
   */
  async canStudentJustify(studentId, matiereId) {
    try {
      const status = await this.checkEliminationStatus(studentId, matiereId);
      return status.canJustifyMore;
    } catch (error) {
      console.error('Error checking if student can justify:', error);
      throw error;
    }
  }

  /**
   * Appeal elimination (student request)
   * @param {Integer} studentId - Student ID
   * @param {Integer} eliminationId - Elimination record ID
   * @param {String} reason - Appeal reason
   */
  async appealElimination(studentId, eliminationId, reason) {
    try {
      const { StudentElimination } = this.models;

      const elimination = await StudentElimination.findByPk(eliminationId);
      if (!elimination) {
        throw new Error('Elimination record not found');
      }

      if (elimination.student_id !== studentId) {
        throw new Error('Unauthorized');
      }

      if (!elimination.can_appeal) {
        throw new Error('This elimination cannot be appealed');
      }

      // Create appeal record
      elimination.appeal_submitted_at = new Date();
      elimination.appeal_reason = reason;
      elimination.appeal_status = 'pending';
      await elimination.save();

      return elimination;
    } catch (error) {
      console.error('Error appealing elimination:', error);
      throw error;
    }
  }

  /**
   * Process elimination appeal (admin decision)
   * @param {Integer} eliminationId - Elimination record ID
   * @param {String} decision - 'approved' or 'rejected'
   * @param {String} notes - Admin notes
   * @param {Integer} userId - Admin user ID
   */
  async processAppeal(eliminationId, decision, notes, userId) {
    try {
      const { StudentElimination } = this.models;

      const elimination = await StudentElimination.findByPk(eliminationId);
      if (!elimination) {
        throw new Error('Elimination record not found');
      }

      if (elimination.appeal_status !== 'pending') {
        throw new Error('Appeal has already been processed');
      }

      elimination.appeal_status = decision;
      elimination.appeal_decision_date = new Date();
      elimination.appeal_notes = notes;
      elimination.appeal_reviewed_by = userId;

      // If appeal approved, restore student's right to justify
      if (decision === 'approved') {
        elimination.can_appeal = false;
        // Note: Student can now justify again - need to track separately
      }

      await elimination.save();

      await this.logAudit({
        userId,
        action: 'PROCESS_APPEAL',
        entityType: 'student_elimination',
        entityId: elimination.id,
        description: `Processed appeal for elimination: ${decision}`,
        newValues: { appeal_status: decision, appeal_notes: notes }
      });

      return elimination;
    } catch (error) {
      console.error('Error processing appeal:', error);
      throw error;
    }
  }
}

module.exports = EliminationService;
