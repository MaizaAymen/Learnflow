const express = require('express');
const multer = require('multer');
const path = require('path');
const { uuidv4 } = require('../utils/uuidGenerator');
const fs = require('fs');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { Internship } = db.models || {};
  
  if (!Internship) {
    console.error('❌ Internship model not found');
  }

  const uploadDir = path.join(__dirname, '../uploads/internships');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}-${file.originalname}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
  });

  // ✅ Register for internship
  router.post('/', authenticate, async (req, res) => {
    try {
      const { companyName, position, startDate, endDate, supervisorInfo, topics, department } = req.body;

      if (!companyName || !position || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const internship = await Internship.create({
        id: uuidv4(),
        studentId: req.user.id,
        companyId: uuidv4(),
        companyName,
        position,
        startDate,
        endDate,
        supervisorInfo: supervisorInfo || null,
        topics: topics || [],
        status: 'pending',
        department: department || null,
      });

      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'internship',
        entityId: internship.id,
        description: `Student registered for internship at ${companyName}`,
        newValues: internship.toJSON(),
      });

      res.status(201).json({ message: 'Internship registered successfully', internship });
    } catch (error) {
      console.error('Error registering internship:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get my internships
  router.get('/my-internships', authenticate, async (req, res) => {
    try {
      const internships = await Internship.findAll({
        where: { studentId: req.user.id },
        order: [['createdAt', 'DESC']],
      });

      res.json(internships);
    } catch (error) {
      console.error('Error fetching internships:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get all internships (Admin)
  router.get('/', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'admin' && req.user.role !== 'department_head') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const { status } = req.query;
      const where = {};
      if (status) where.status = status;

      const internships = await Internship.findAll({
        where,
        order: [['createdAt', 'DESC']],
      });

      res.json(internships);
    } catch (error) {
      console.error('Error fetching internships:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Upload internship report
  router.post('/:internshipId/report', authenticate, upload.single('file'), async (req, res) => {
    try {
      const internship = await Internship.findByPk(req.params.internshipId);
      if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
      }

      // if (internship.studentId !== req.user.id && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      internship.reportPath = req.file.path;
      internship.reportSubmittedAt = new Date();
      await internship.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'internship',
        entityId: internship.id,
        description: 'Student uploaded internship report',
      });

      res.json({ message: 'Report uploaded successfully', internship });
    } catch (error) {
      console.error('Error uploading report:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Approve internship
  router.put('/:internshipId/approve', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'admin' && req.user.role !== 'department_head') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const internship = await Internship.findByPk(req.params.internshipId);
      if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
      }

      internship.status = 'approved';
      internship.approvedAt = new Date();
      internship.approvedBy = req.user.id;
      await internship.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'internship',
        entityId: internship.id,
        description: 'Internship approved by supervisor',
      });

      res.json({ message: 'Internship approved successfully', internship });
    } catch (error) {
      console.error('Error approving internship:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Evaluate internship
  router.put('/:internshipId/evaluate', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const { evaluationScore, feedback, juries } = req.body;
      const internship = await Internship.findByPk(req.params.internshipId);

      if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
      }

      internship.evaluationScore = evaluationScore;
      internship.evaluationFeedback = feedback || null;
      internship.juries = juries || [];
      internship.status = 'completed';
      internship.evaluatedAt = new Date();
      internship.evaluatedBy = req.user.id;
      await internship.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'internship',
        entityId: internship.id,
        description: `Internship evaluated: score ${evaluationScore}`,
      });

      res.json({ message: 'Internship evaluated successfully', internship });
    } catch (error) {
      console.error('Error evaluating internship:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
