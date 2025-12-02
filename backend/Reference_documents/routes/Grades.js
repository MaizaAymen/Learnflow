const express = require('express');
const { uuidv4 } = require('../utils/uuidGenerator');
const NotificationClient = require('../../Service de Notifications/services/NotificationClient');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { Grade, GradeHistory, User } = db.models || {};
  
  if (!Grade || !GradeHistory) {
    console.error('❌ Grade or GradeHistory models not found');
  }

  // ✅ Add grade (Teacher only)
  router.post('/', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Only teachers can add grades' });
      // }

      const { studentId, subjectId, courseId, gradeType, marks, maxMarks, weight, description, feedback } = req.body;

      if (!studentId || !subjectId || !gradeType || marks === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (marks < 0 || marks > (maxMarks || 20)) {
        return res.status(400).json({ error: 'Marks out of range' });
      }

      const percentage = ((marks / (maxMarks || 20)) * 100).toFixed(2);

      const grade = await Grade.create({
        id: uuidv4(),
        studentId,
        subjectId,
        courseId: courseId || null,
        gradeType,
        marks,
        maxMarks: maxMarks || 20,
        percentage,
        weight: weight || 1,
        description,
        feedback,
        publishedToStudent: false,
        createdBy: req.user.id,
      });

      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'grade',
        entityId: grade.id,
        description: `Added grade for student ${studentId}: ${marks}/${maxMarks || 20}`,
        newValues: grade.toJSON(),
      });

      res.status(201).json({ message: 'Grade added successfully', grade });
    } catch (error) {
      console.error('Error adding grade:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get all grades for a student
  router.get('/student/:studentId', authenticate, async (req, res) => {
    try {
      const { studentId } = req.params;

      // Students can only see their own grades
      // if (req.user.role === 'student' && req.user.id !== studentId) {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const grades = await Grade.findAll({
        where: { studentId, publishedToStudent: true },
        order: [['createdAt', 'DESC']],
      });

      res.json(grades);
    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get all grades for a course
  router.get('/course/:courseId', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const grades = await Grade.findAll({
        where: { courseId: req.params.courseId },
        order: [['studentId', 'ASC']],
      });

      res.json(grades);
    } catch (error) {
      console.error('Error fetching course grades:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Update grade with history tracking
  router.put('/:gradeId', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Only teachers can update grades' });
      // }

      const grade = await Grade.findByPk(req.params.gradeId);
      if (!grade) {
        return res.status(404).json({ error: 'Grade not found' });
      }

      const { marks, feedback, changeReason } = req.body;

      // Log history
      await GradeHistory.create({
        id: uuidv4(),
        gradeId: grade.id,
        studentId: grade.studentId,
        previousMarks: grade.marks,
        newMarks: marks || grade.marks,
        previousFeedback: grade.feedback,
        newFeedback: feedback || grade.feedback,
        changeReason,
        modifiedBy: req.user.id,
      });

      // Update grade
      if (marks !== undefined) {
        grade.marks = marks;
        grade.percentage = ((marks / grade.maxMarks) * 100).toFixed(2);
      }
      if (feedback !== undefined) {
        grade.feedback = feedback;
      }

      await grade.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'grade',
        entityId: grade.id,
        description: `Updated grade: ${marks} (reason: ${changeReason})`,
        oldValues: { marks: grade.marks },
        newValues: grade.toJSON(),
      });

      // 🔔 Send notification to student about grade update
      try {
        await NotificationClient.send({
          recipient_id: grade.studentId,
          type: 'grade_updated',
          title: '📊 Grade Updated',
          content: `Your grade has been updated: ${marks}/${grade.maxMarks} (${((marks / grade.maxMarks) * 100).toFixed(2)}%)${feedback ? ` - Feedback: ${feedback}` : ''}`,
          metadata: {
            grade_id: grade.id,
            old_marks: marks - (req.body.marks - grade.marks),
            new_marks: marks,
            subject_id: grade.subjectId,
            change_reason: changeReason,
            timestamp: new Date().toISOString()
          },
          priority: 'high',
          action_url: `/grades/${grade.id}`
        });
      } catch (error) {
        console.warn('⚠️ Failed to send grade update notification:', error.message);
      }

      res.json({ message: 'Grade updated successfully', grade });
    } catch (error) {
      console.error('Error updating grade:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Publish grades to students
  router.post('/:gradeId/publish', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const grade = await Grade.findByPk(req.params.gradeId);
      if (!grade) {
        return res.status(404).json({ error: 'Grade not found' });
      }

      grade.publishedToStudent = true;
      grade.publishedAt = new Date();
      await grade.save();

      await logAudit({
        userId: req.user.id,
        action: 'PUBLISH',
        entityType: 'grade',
        entityId: grade.id,
        description: `Published grade to student ${grade.studentId}`,
      });

      // 🔔 Send notification to student about grade publication
      try {
        await NotificationClient.send({
          recipient_id: grade.studentId,
          type: 'grade_published',
          title: '📢 Grade Published',
          content: `Your grade has been published: ${grade.marks}/${grade.maxMarks} (${grade.percentage}%)`,
          metadata: {
            grade_id: grade.id,
            marks: grade.marks,
            percentage: grade.percentage,
            subject_id: grade.subjectId,
            published_by: req.user.id,
            timestamp: new Date().toISOString()
          },
          priority: 'high',
          action_url: `/grades/${grade.id}`
        });
      } catch (error) {
        console.warn('⚠️ Failed to send grade publication notification:', error.message);
      }

      res.json({ message: 'Grade published successfully', grade });
    } catch (error) {
      console.error('Error publishing grade:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get grade history
  router.get('/:gradeId/history', authenticate, async (req, res) => {
    try {
      const history = await GradeHistory.findAll({
        where: { gradeId: req.params.gradeId },
        order: [['modifiedAt', 'DESC']],
      });

      res.json(history);
    } catch (error) {
      console.error('Error fetching grade history:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get grade statistics for student
  router.get('/stats/student/:studentId', authenticate, async (req, res) => {
    try {
      const { studentId } = req.params;

      // if (req.user.role === 'student' && req.user.id !== studentId) {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const grades = await Grade.findAll({
        where: { studentId, publishedToStudent: true },
      });

      const stats = {
        totalGrades: grades.length,
        average: (grades.reduce((sum, g) => sum + (g.marks / g.maxMarks * 100), 0) / grades.length).toFixed(2),
        byType: {},
        trend: [],
      };

      grades.forEach(grade => {
        if (!stats.byType[grade.gradeType]) {
          stats.byType[grade.gradeType] = { count: 0, average: 0 };
        }
        stats.byType[grade.gradeType].count++;
      });

      res.json(stats);
    } catch (error) {
      console.error('Error fetching grade statistics:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
