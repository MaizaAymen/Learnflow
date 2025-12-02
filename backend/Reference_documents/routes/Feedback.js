/**
 * Course and Teacher Feedback System
 * Path: backend/Reference_documents/routes/Feedback.js
 */

const express = require('express');
const router = express.Router();
const sequelize = require('../../auth-service/config');

// Import models to ensure they're initialized
const models = require('../models');

/**
 * GET /api/feedback/courses
 * Get all courses with feedback stats
 */
router.get('/courses', async (req, res) => {
  try {
    // Try to query with LEFT JOIN first
    let query = `
      SELECT 
        m.id,
        m.nom as course_name,
        COALESCE(COUNT(DISTINCT cf.id), 0) as feedback_count,
        COALESCE(AVG(CAST(cf.rating AS FLOAT)), 0) as average_rating,
        COALESCE(COUNT(DISTINCT cf.user_id), 0) as unique_reviewers
      FROM referentiels.matiere m
      LEFT JOIN public.course_feedback cf ON m.id = cf.course_id
      GROUP BY m.id, m.nom
      ORDER BY m.nom
    `;

    try {
      const courses = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
      return res.json(courses);
    } catch (joinError) {
      // If the public.course_feedback table doesn't exist, just query the courses without feedback
      console.warn('Course feedback table not available, returning courses without feedback stats');
      const simpleQuery = `
        SELECT 
          m.id,
          m.nom as course_name,
          0 as feedback_count,
          0 as average_rating,
          0 as unique_reviewers
        FROM referentiels.matiere m
        ORDER BY m.nom
      `;
      const courses = await sequelize.query(simpleQuery, { type: sequelize.QueryTypes.SELECT });
      return res.json(courses);
    }
  } catch (error) {
    console.error('Error fetching courses:', error.message);
    // Return empty array instead of 500 error
    res.json([]);
  }
});

/**
 * GET /api/feedback/teachers
 * Get all teachers with feedback stats
 */
router.get('/teachers', async (req, res) => {
  try {
    // Try to query with LEFT JOIN first
    let query = `
      SELECT 
        u.id,
        u.nom,
        u.prenom,
        COALESCE(COUNT(DISTINCT tf.id), 0) as feedback_count,
        COALESCE(AVG(CAST(tf.rating AS FLOAT)), 0) as average_rating,
        COALESCE(COUNT(DISTINCT tf.user_id), 0) as unique_reviewers
      FROM auth.utilisateur u
      LEFT JOIN public.teacher_feedback tf ON u.id = tf.teacher_id
      WHERE u.role = 'enseignant'
      GROUP BY u.id, u.nom, u.prenom
      ORDER BY u.nom, u.prenom
    `;

    try {
      const teachers = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
      return res.json(teachers);
    } catch (joinError) {
      // If the public.teacher_feedback table doesn't exist, just query the teachers without feedback
      console.warn('Teacher feedback table not available, returning teachers without feedback stats');
      const simpleQuery = `
        SELECT 
          u.id,
          u.nom,
          u.prenom,
          0 as feedback_count,
          0 as average_rating,
          0 as unique_reviewers
        FROM auth.utilisateur u
        WHERE u.role = 'enseignant'
        ORDER BY u.nom, u.prenom
      `;
      const teachers = await sequelize.query(simpleQuery, { type: sequelize.QueryTypes.SELECT });
      return res.json(teachers);
    }
  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    // Return empty array instead of 500 error
    res.json([]);
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
        m.id,
        m.nom as course_name,
        COUNT(DISTINCT cf.id) as feedback_count,
        COALESCE(AVG(cf.rating), 0) as average_rating
      FROM referentiels.matiere m
      LEFT JOIN public.course_feedback cf ON m.id = cf.course_id
      WHERE m.id = ?
      GROUP BY m.id, m.nom
    `;

    const courses = await sequelize.query(courseQuery, { 
      replacements: [courseId], 
      type: sequelize.QueryTypes.SELECT 
    });

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
      FROM public.course_feedback cf
      LEFT JOIN auth.utilisateur u ON cf.user_id = u.id
      WHERE cf.course_id = ?
      ORDER BY cf.created_at DESC
    `;

    const feedback = await sequelize.query(feedbackQuery, { 
      replacements: [courseId], 
      type: sequelize.QueryTypes.SELECT 
    });

    res.json({
      success: true,
      data: {
        ...courses[0],
        feedback
      }
    });
  } catch (error) {
    console.error('Error fetching course feedback:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course feedback',
      details: error.message
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
        COALESCE(AVG(tf.rating), 0) as average_rating
      FROM auth.utilisateur u
      LEFT JOIN public.teacher_feedback tf ON u.id = tf.teacher_id
      WHERE u.id = ?
      GROUP BY u.id, u.nom, u.prenom
    `;

    const teachers = await sequelize.query(teacherQuery, { 
      replacements: [teacherId], 
      type: sequelize.QueryTypes.SELECT 
    });

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
      FROM public.teacher_feedback tf
      LEFT JOIN auth.utilisateur u ON tf.user_id = u.id
      WHERE tf.teacher_id = ?
      ORDER BY tf.created_at DESC
    `;

    const feedbackData = await sequelize.query(feedbackQuery, { 
      replacements: [teacherId], 
      type: sequelize.QueryTypes.SELECT 
    });

    res.json({
      success: true,
      data: {
        ...teachers[0],
        feedback: feedbackData
      }
    });
  } catch (error) {
    console.error('Error fetching teacher feedback:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teacher feedback',
      details: error.message
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
    const { rating, comment, userId } = req.body;

    // Get userId from request (either from token or body)
    const actualUserId = userId || (req.user ? req.user.id : null);

    if (!actualUserId) {
      return res.status(401).json({
        success: false,
        error: 'User ID required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if course exists
    const courses = await sequelize.query(
      'SELECT id FROM referentiels.matiere WHERE id = ?',
      { replacements: [courseId], type: sequelize.QueryTypes.SELECT }
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if feedback already exists
    const existing = await sequelize.query(
      'SELECT id FROM public.course_feedback WHERE course_id = ? AND user_id = ?',
      { replacements: [courseId, actualUserId], type: sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      // Update
      await sequelize.query(
        `UPDATE public.course_feedback 
         SET rating = ?, comment = ?, updated_at = NOW() 
         WHERE course_id = ? AND user_id = ?`,
        { replacements: [rating, comment || null, courseId, actualUserId] }
      );
    } else {
      // Insert
      await sequelize.query(
        `INSERT INTO public.course_feedback (course_id, user_id, rating, comment, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [courseId, actualUserId, rating, comment || null] }
      );
    }

    res.json({
      success: true,
      message: 'Course feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting course feedback:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      details: error.message
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
    const { rating, comment, userId } = req.body;

    // Get userId from request (either from token or body)
    const actualUserId = userId || (req.user ? req.user.id : null);

    if (!actualUserId) {
      return res.status(401).json({
        success: false,
        error: 'User ID required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if teacher exists
    const teachers = await sequelize.query(
      'SELECT id FROM auth.utilisateur WHERE id = ? AND role = ?',
      { replacements: [teacherId, 'enseignant'], type: sequelize.QueryTypes.SELECT }
    );

    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Check if feedback already exists
    const existing = await sequelize.query(
      'SELECT id FROM public.teacher_feedback WHERE teacher_id = ? AND user_id = ?',
      { replacements: [teacherId, actualUserId], type: sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      // Update
      await sequelize.query(
        `UPDATE public.teacher_feedback 
         SET rating = ?, comment = ?, updated_at = NOW() 
         WHERE teacher_id = ? AND user_id = ?`,
        { replacements: [rating, comment || null, teacherId, actualUserId] }
      );
    } else {
      // Insert
      await sequelize.query(
        `INSERT INTO public.teacher_feedback (teacher_id, user_id, rating, comment, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [teacherId, actualUserId, rating, comment || null] }
      );
    }

    res.json({
      success: true,
      message: 'Teacher feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting teacher feedback:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      details: error.message
    });
  }
});

/**
 * GET /api/feedback/my-feedback
 * Get current user's feedback
 */
router.get('/my-feedback', async (req, res) => {
  try {
    const userId = req.query.userId || (req.user ? req.user.id : null);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID required'
      });
    }

    const courseFeedbackQuery = `
      SELECT 
        cf.id,
        'course' as type,
        m.id as entity_id,
        m.nom as entity_name,
        cf.rating,
        cf.comment,
        cf.created_at
      FROM public.course_feedback cf
      LEFT JOIN referentiels.matiere m ON cf.course_id = m.id
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
      FROM public.teacher_feedback tf
      LEFT JOIN auth.utilisateur u ON tf.teacher_id = u.id
      WHERE tf.user_id = ?
      ORDER BY tf.created_at DESC
    `;

    const courseFeedback = await sequelize.query(courseFeedbackQuery, { 
      replacements: [userId], 
      type: sequelize.QueryTypes.SELECT 
    });
    
    const teacherFeedback = await sequelize.query(teacherFeedbackQuery, { 
      replacements: [userId], 
      type: sequelize.QueryTypes.SELECT 
    });

    const allFeedback = [...courseFeedback, ...teacherFeedback].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json({
      success: true,
      data: allFeedback
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your feedback',
      details: error.message
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
    const userId = req.query.userId || (req.user ? req.user.id : null);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID required'
      });
    }

    // Check if feedback exists and belongs to user
    const feedback = await sequelize.query(
      'SELECT user_id FROM public.course_feedback WHERE id = ?',
      { replacements: [feedbackId], type: sequelize.QueryTypes.SELECT }
    );

    if (!feedback || feedback.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    if (feedback[0].user_id !== userId && feedback[0].user_id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own feedback'
      });
    }

    await sequelize.query('DELETE FROM public.course_feedback WHERE id = ?', { 
      replacements: [feedbackId] 
    });

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback',
      details: error.message
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
    const userId = req.query.userId || (req.user ? req.user.id : null);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID required'
      });
    }

    // Check if feedback exists and belongs to user
    const feedback = await sequelize.query(
      'SELECT user_id FROM public.teacher_feedback WHERE id = ?',
      { replacements: [feedbackId], type: sequelize.QueryTypes.SELECT }
    );

    if (!feedback || feedback.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    if (feedback[0].user_id !== userId && feedback[0].user_id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own feedback'
      });
    }

    await sequelize.query('DELETE FROM public.teacher_feedback WHERE id = ?', { 
      replacements: [feedbackId] 
    });

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback',
      details: error.message
    });
  }
});

module.exports = router;
