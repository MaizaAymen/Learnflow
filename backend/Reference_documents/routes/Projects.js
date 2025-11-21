const express = require('express');
const multer = require('multer');
const path = require('path');
const { uuidv4 } = require('../utils/uuidGenerator');
const fs = require('fs');
const sequelize = require('../../auth-service/config');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { Project } = db.models || {};
  
  if (!Project) {
    console.error('❌ Project model not found');
  }

  const uploadDir = path.join(__dirname, '../uploads/projects');
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

  // ✅ Register project/PFE - SIMPLIFIED APPROACH
  router.post('/', authenticate, async (req, res) => {
    try {
      const { projectType, topic, description, supervisorId, courseId, title, objectives } = req.body;

      console.log('📝 Project registration - Minimal approach:', { 
        projectType, 
        topic, 
        courseId, 
        title,
        userId: req.user.id,
        userIdType: typeof req.user.id
      });

      // Strict validation
      if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
      if (!projectType?.trim()) return res.status(400).json({ error: 'Project type is required' });
      if (!topic?.trim()) return res.status(400).json({ error: 'Topic is required' });
      if (!courseId) return res.status(400).json({ error: 'Course ID is required' });
      if (!req.user?.id) return res.status(400).json({ error: 'User not authenticated' });

      const projectId = uuidv4();
      
      // Handle both INTEGER and UUID user IDs
      let studentId;
      const userId = req.user.id;
      const userIdType = typeof userId;
      
      console.log('🔍 Raw user ID:', userId, 'Type:', userIdType);
      
      // If user ID is INTEGER (from auth service), convert to UUID format
      if (Number.isInteger(userId)) {
        // Convert integer ID to UUID by padding with zeros
        // Format: 00000000-0000-0000-0000-000000000001 (for ID=1)
        const paddedId = String(userId).padStart(8, '0');
        studentId = `00000000-0000-0000-0000-${paddedId.padStart(12, '0')}`;
        console.log('✅ Converted INTEGER user ID to UUID:', studentId);
      } else if (userIdType === 'string') {
        // Check if it's already a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(userId)) {
          studentId = userId;
          console.log('✅ User ID is already valid UUID:', studentId);
        } else {
          console.error('❌ Invalid studentId format:', userId, 'Type:', userIdType);
          return res.status(400).json({ error: 'Invalid user ID format' });
        }
      } else {
        console.error('❌ Unexpected user ID type:', userIdType, 'Value:', userId);
        return res.status(400).json({ error: 'Invalid user ID type' });
      }

      // MINIMAL: Only set fields defined in the model without timestamps
      const projectData = {
        id: projectId,
        title: title.trim(),
        courseId: Number(courseId),
        projectType: projectType.trim(),
        topic: topic.trim(),
        description: description ? description.trim() : null,
        studentId: studentId, // Must be UUID string
        status: 'draft',
        objectives: Array.isArray(objectives) ? objectives : [],
        supervisorId: supervisorId || null,
        studentGroup: [],
        juries: [],
        meetings: [],
        tags: []
      };

      console.log('🔧 Creating project with data:', { 
        id: projectData.id, 
        title: projectData.title,
        studentId: projectData.studentId,
        studentIdType: typeof projectData.studentId
      });

      // Use bulkCreate to insert with raw mode (avoid timestamps)
      const created = await Project.bulkCreate([projectData], {
        fields: Object.keys(projectData),
        validate: false,
        individualHooks: false,
        ignoreDuplicates: false
      });

      const project = created[0];
      console.log('✅ Project created:', { id: project.id, title: project.title });

      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'project',
        entityId: projectId,
        description: `Student registered ${projectType}: ${topic}`,
        newValues: project.toJSON()
      });

      return res.status(201).json({ 
        message: 'Project registered successfully', 
        project: project.toJSON() 
      });

    } catch (error) {
      console.error('❌ Error registering project:', error.message);
      console.error('SQL:', error.sql);
      console.error('Original:', error.original?.message);
      console.error('Full error:', error);
      
      res.status(500).json({ 
        error: error.message || 'Failed to create project'
      });
    }
  });

  // ✅ Get my projects
  router.get('/my-projects', authenticate, async (req, res) => {
    try {
      const projects = await Project.findAll({
        where: { studentId: req.user.id },
        order: [['createdAt', 'DESC']],
      });

      res.json(projects);
    } catch (error) {
      console.error('❌ Error fetching projects:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // ✅ Get project by ID
  router.get('/:projectId', authenticate, async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get projects for course (Teacher)
  router.get('/course/:courseId', authenticate, async (req, res) => {
    try {
      console.log('📚 Fetching projects for course:', req.params.courseId);
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const projects = await Project.findAll({
        where: { courseId: parseInt(req.params.courseId) },
        order: [['createdAt', 'DESC']],
      });

      console.log(`✅ Found ${projects.length} projects`);
      res.json(projects);
    } catch (error) {
      console.error('❌ Error fetching projects:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // ✅ Submit project (Upload report)
  router.post('/:projectId/submit', authenticate, upload.single('file'), async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // if (project.studentId !== req.user.id && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      project.reportPath = req.file.path;
      project.submittedAt = new Date();
      project.status = 'submitted';
      project.updatedAt = new Date();
      await project.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'project',
        entityId: project.id,
        description: 'Project report submitted',
      });

      res.json({ message: 'Project submitted successfully', project });
    } catch (error) {
      console.error('Error submitting project:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Approve project topic
  router.put('/:projectId/approve', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const project = await Project.findByPk(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      project.status = 'approved';
      project.approvedAt = new Date();
      project.approvedBy = req.user.id;
      project.updatedAt = new Date();
      await project.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'project',
        entityId: project.id,
        description: 'Project topic approved',
      });

      res.json({ message: 'Project approved successfully', project });
    } catch (error) {
      console.error('Error approving project:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Add meeting
  router.post('/:projectId/meeting', authenticate, async (req, res) => {
    try {
      const { meetingDate, attendees, notes } = req.body;
      const project = await Project.findByPk(req.params.projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // if (project.studentId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const meeting = {
        id: uuidv4(),
        date: meetingDate,
        attendees: attendees || [],
        notes: notes || null,
        createdAt: new Date(),
      };

      if (!project.meetings) project.meetings = [];
      project.meetings.push(meeting);
      project.updatedAt = new Date();
      await project.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'project',
        entityId: project.id,
        description: 'Meeting added to project',
      });

      res.json({ message: 'Meeting added successfully', project });
    } catch (error) {
      console.error('Error adding meeting:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Schedule presentation
  router.put('/:projectId/presentation', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const { presentationDate, location, juries } = req.body;
      const project = await Project.findByPk(req.params.projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      project.presentationDate = presentationDate;
      project.presentationLocation = location;
      project.juries = juries || [];
      project.status = 'in_evaluation';
      project.updatedAt = new Date();
      await project.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'project',
        entityId: project.id,
        description: `Presentation scheduled for ${presentationDate}`,
      });

      res.json({ message: 'Presentation scheduled successfully', project });
    } catch (error) {
      console.error('Error scheduling presentation:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Evaluate project
  router.put('/:projectId/evaluate', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const { evaluationScore, feedback } = req.body;
      const project = await Project.findByPk(req.params.projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      project.evaluationScore = evaluationScore;
      project.evaluationFeedback = feedback || null;
      project.status = 'completed';
      project.evaluatedAt = new Date();
      project.evaluatedBy = req.user.id;
      project.updatedAt = new Date();
      await project.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'project',
        entityId: project.id,
        description: `Project evaluated: score ${evaluationScore}`,
      });

      res.json({ message: 'Project evaluated successfully', project });
    } catch (error) {
      console.error('Error evaluating project:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
