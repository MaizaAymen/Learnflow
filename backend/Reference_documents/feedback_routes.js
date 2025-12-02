/**
 * Course and Teacher Feedback System
 * Path: backend/Reference_documents/feedback_routes.js
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * GET /api/feedback/courses
 * Get all courses with feedback stats
 */
router.get('/courses', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name as course_name,
        COUNT(DISTINCT cf.id) as feedback_count,
        AVG(cf.rating) as average_rating,
        COUNT(DISTINCT cf.user_id) as unique_reviewers
      FROM matieres c
      LEFT JOIN course_feedback cf ON c.id = cf.course_id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `;

    const [courses] = await pool.query(query);
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
});

/**
 * GET /api/feedback/teachers
 * Get all teachers with feedback stats
 */
router.get('/teachers', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.nom,
        u.prenom,
        COUNT(DISTINCT tf.id) as feedback_count,
        AVG(tf.rating) as average_rating,
        COUNT(DISTINCT tf.user_id) as unique_reviewers
      FROM users u
      LEFT JOIN teacher_feedback tf ON u.id = tf.teacher_id
      WHERE u.role = 'enseignant'
      GROUP BY u.id, u.nom, u.prenom
      ORDER BY u.nom, u.prenom
    `;

    const [teachers] = await pool.query(query);
    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teachers'
    });
  }
});

/**
 * GET /api/feedback/course/:courseId
 * Get detailed feedback for a specific course
 */
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    const courseQuery = `
      SELECT 
        c.id,
        c.name as course_name,
        COUNT(DISTINCT cf.id) as feedback_count,
        AVG(cf.rating) as average_rating
      FROM matieres c
      LEFT JOIN course_feedback cf ON c.id = cf.course_id
      WHERE c.id = ?
      GROUP BY c.id, c.name
    `;

    const [courses] = await pool.query(courseQuery, [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const feedbackQuery = `
      SELECT 
        cf.id,
        cf.rating,
        cf.comment,
        cf.created_at,
        u.nom,
        u.prenom,
        u.id as user_id
      FROM course_feedback cf
      LEFT JOIN users u ON cf.user_id = u.id
      WHERE cf.course_id = ?
      ORDER BY cf.created_at DESC
    `;

    const [feedback] = await pool.query(feedbackQuery, [courseId]);

    res.json({
      success: true,
      data: {
        ...courses[0],
        feedback
      }
    });
  } catch (error) {
    console.error('Error fetching course feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course feedback'
    });
  }
});

/**
 * GET /api/feedback/teacher/:teacherId
 * Get detailed feedback for a specific teacher
 */
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacherQuery = `
      SELECT 
        u.id,
        u.nom,
        u.prenom,
        COUNT(DISTINCT tf.id) as feedback_count,
        AVG(tf.rating) as average_rating
      FROM users u
      LEFT JOIN teacher_feedback tf ON u.id = tf.teacher_id
      WHERE u.id = ?
      GROUP BY u.id, u.nom, u.prenom
    `;

    const [teachers] = await pool.query(teacherQuery, [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    const feedbackQuery = `
      SELECT 
        tf.id,
        tf.rating,
        tf.comment,
        tf.created_at,
        u.nom,
        u.prenom,
        u.id as user_id
      FROM teacher_feedback tf
      LEFT JOIN users u ON tf.user_id = u.id
      WHERE tf.teacher_id = ?
      ORDER BY tf.created_at DESC
    `;

    const [feedback] = await pool.query(feedbackQuery, [teacherId]);

    res.json({
      success: true,
      data: {
        ...teachers[0],
        feedback
      }
    });
  } catch (error) {
    console.error('Error fetching teacher feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teacher feedback'
    });
  }
});

/**
 * POST /api/feedback/course/:courseId
 * Submit feedback for a course
 */
router.post('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if course exists
    const [courses] = await pool.query(
      'SELECT id FROM matieres WHERE id = ?',
      [courseId]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Insert or update feedback
    const query = `
      INSERT INTO course_feedback (course_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      rating = ?, comment = ?, updated_at = NOW()
    `;

    await pool.query(query, [
      courseId,
      req.user.id,
      rating,
      comment || null,
      rating,
      comment || null
    ]);

    res.json({
      success: true,
      message: 'Course feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting course feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

/**
 * POST /api/feedback/teacher/:teacherId
 * Submit feedback for a teacher
 */
router.post('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if teacher exists
    const [teachers] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [teacherId]
    );

    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Insert or update feedback
    const query = `
      INSERT INTO teacher_feedback (teacher_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      rating = ?, comment = ?, updated_at = NOW()
    `;

    await pool.query(query, [
      teacherId,
      req.user.id,
      rating,
      comment || null,
      rating,
      comment || null
    ]);

    res.json({
      success: true,
      message: 'Teacher feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting teacher feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

/**
 * GET /api/feedback/my-feedback
 * Get current user's feedback
 */
router.get('/my-feedback', async (req, res) => {
  try {
    const courseFeedbackQuery = `
      SELECT 
        cf.id,
        'course' as type,
        m.id as entity_id,
        m.name as entity_name,
        cf.rating,
        cf.comment,
        cf.created_at
      FROM course_feedback cf
      LEFT JOIN matieres m ON cf.course_id = m.id
      WHERE cf.user_id = ?
      ORDER BY cf.created_at DESC
    `;

    const teacherFeedbackQuery = `
      SELECT 
        tf.id,
        'teacher' as type,
        u.id as entity_id,
        CONCAT(u.nom, ' ', u.prenom) as entity_name,
        tf.rating,
        tf.comment,
        tf.created_at
      FROM teacher_feedback tf
      LEFT JOIN users u ON tf.teacher_id = u.id
      WHERE tf.user_id = ?
      ORDER BY tf.created_at DESC
    `;

    const [courseFeedback] = await pool.query(courseFeedbackQuery, [req.user.id]);
    const [teacherFeedback] = await pool.query(teacherFeedbackQuery, [req.user.id]);

    const allFeedback = [...courseFeedback, ...teacherFeedback].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json({
      success: true,
      data: allFeedback
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your feedback'
    });
  }
});

/**
 * DELETE /api/feedback/course/:feedbackId
 * Delete course feedback
 */
router.delete('/course/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;

    // Check if feedback exists and belongs to user
    const [feedback] = await pool.query(
      'SELECT user_id FROM course_feedback WHERE id = ?',
      [feedbackId]
    );

    if (feedback.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    if (feedback[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own feedback'
      });
    }

    await pool.query('DELETE FROM course_feedback WHERE id = ?', [feedbackId]);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback'
    });
  }
});

/**
 * DELETE /api/feedback/teacher/:feedbackId
 * Delete teacher feedback
 */
router.delete('/teacher/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;

    // Check if feedback exists and belongs to user
    const [feedback] = await pool.query(
      'SELECT user_id FROM teacher_feedback WHERE id = ?',
      [feedbackId]
    );

    if (feedback.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    if (feedback[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own feedback'
      });
    }

    await pool.query('DELETE FROM teacher_feedback WHERE id = ?', [feedbackId]);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback'
    });
  }
});

module.exports = router;
