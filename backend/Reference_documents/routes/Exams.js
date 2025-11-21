const express = require('express');
const { uuidv4 } = require('../utils/uuidGenerator');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { Exam, User } = db.models || {};
  
  if (!Exam) {
    console.error('❌ Exam model not found');
  }

  // ✅ Create exam
  router.post('/', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Only teachers can create exams' });
      // }

      const {
        title, subjectId, courseId, examType, date, endDate,
        location, room, totalMarks, duration, description, capacity, supervisor,
      } = req.body;

      if (!title || !subjectId || !courseId || !examType || !date || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const exam = await Exam.create({
        id: uuidv4(),
        title,
        subjectId,
        courseId,
        examType,
        date,
        endDate,
        location: location || null,
        room: room || null,
        totalMarks: totalMarks || 20,
        duration: duration || null,
        description: description || null,
        capacity: capacity || null,
        supervisor: supervisor || null,
        createdBy: req.user.id,
      });

      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'exam',
        entityId: exam.id,
        description: `Created exam: ${title} (${examType})`,
        newValues: exam.toJSON(),
      });

      res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (error) {
      console.error('Error creating exam:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get all exams
  router.get('/', authenticate, async (req, res) => {
    try {
      const { courseId, type, status } = req.query;
      const where = {};
      if (courseId) where.courseId = courseId;
      if (type) where.examType = type;
      if (status) where.status = status;

      const exams = await Exam.findAll({
        where,
        order: [['date', 'ASC']],
      });

      res.json(exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get exam by ID
  router.get('/:examId', authenticate, async (req, res) => {
    try {
      const exam = await Exam.findByPk(req.params.examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      res.json(exam);
    } catch (error) {
      console.error('Error fetching exam:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Update exam
  router.put('/:examId', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const exam = await Exam.findByPk(req.params.examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      const { title, date, endDate, location, room, status, description } = req.body;

      const oldValues = exam.toJSON();

      if (title) exam.title = title;
      if (date) exam.date = date;
      if (endDate) exam.endDate = endDate;
      if (location) exam.location = location;
      if (room) exam.room = room;
      if (status) exam.status = status;
      if (description) exam.description = description;

      await exam.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'exam',
        entityId: exam.id,
        description: `Updated exam: ${exam.title}`,
        oldValues,
        newValues: exam.toJSON(),
      });

      res.json({ message: 'Exam updated successfully', exam });
    } catch (error) {
      console.error('Error updating exam:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Publish exam results
  router.post('/:examId/publish-results', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const exam = await Exam.findByPk(req.params.examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      exam.resultsPublished = true;
      exam.publishedAt = new Date();
      await exam.save();

      await logAudit({
        userId: req.user.id,
        action: 'PUBLISH',
        entityType: 'exam',
        entityId: exam.id,
        description: `Published results for exam: ${exam.title}`,
      });

      res.json({ message: 'Results published successfully', exam });
    } catch (error) {
      console.error('Error publishing results:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Delete exam
  router.delete('/:examId', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const exam = await Exam.findByPk(req.params.examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      const examData = exam.toJSON();
      await exam.destroy();

      await logAudit({
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'exam',
        entityId: exam.id,
        description: `Deleted exam: ${exam.title}`,
        oldValues: examData,
      });

      res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
      console.error('Error deleting exam:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
