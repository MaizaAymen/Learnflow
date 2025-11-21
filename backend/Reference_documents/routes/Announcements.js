  const express = require('express');
  const { uuidv4 } = require('../utils/uuidGenerator');
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');

  // Configure multer for PDF uploads
  const uploadsDir = path.join(__dirname, '../../uploads/announcements');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });

  module.exports = (db, authenticate, logAudit) => {
    const router = express.Router();
    
    // Get models from the passed object
    const { Announcement } = db.models || {};
    
    if (!Announcement) {
      console.error('❌ Announcement model not found');
    }

    // ✅ Create announcement
    router.post('/', authenticate, upload.single('pdfFile'), async (req, res) => {
      try {
        const { title, content, type, priority, visibility, tags, courseId } = req.body;

        // Validation
        if (!title || !title.trim()) {
          return res.status(400).json({ error: 'Title is required and cannot be empty' });
        }
        if (!content || !content.trim()) {
          return res.status(400).json({ error: 'Content is required and cannot be empty' });
        }
        if (!type) {
          return res.status(400).json({ error: 'Type is required' });
        }
        if (!req.user || !req.user.id) {
          return res.status(401).json({ error: 'User not authenticated' });
        }

        const validTypes = ['announcement', 'event', 'urgent', 'maintenance', 'deadline'];
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        const validVisibility = ['all', 'department', 'course', 'admin', 'specific'];

        if (!validTypes.includes(type)) {
          return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
        }
        if (priority && !validPriorities.includes(priority)) {
          return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
        }
        if (visibility && !validVisibility.includes(visibility)) {
          return res.status(400).json({ error: `Invalid visibility. Must be one of: ${validVisibility.join(', ')}` });
        }

        // Build attachments array
        const attachments = [];
        if (req.file) {
          attachments.push({
            filename: req.file.originalname,
            path: `/uploads/announcements/${req.file.filename}`,
            uploadedAt: new Date(),
            size: req.file.size,
          });
        }

        const announcement = await Announcement.create({
          id: uuidv4(),
          title: title.trim(),
          content: content.trim(),
          type,
          priority: priority || 'medium',
          visibility: visibility || 'all',
          tags: Array.isArray(tags) ? tags : [],
          courseId: courseId ? String(courseId) : null,
          authorId: String(req.user.id),
          authorName: req.user.name || 'Unknown',
          authorRole: req.user.role || 'user',
          isPublished: true,
          publishedAt: new Date(),
          attachments,
        });

        await logAudit({
          userId: String(req.user.id),
          userName: req.user.name || 'Unknown',
          action: 'CREATE',
          entityType: 'announcement',
          entityId: announcement.id,
          description: `Created announcement: ${title}${req.file ? ' (with PDF attachment)' : ''}`,
          newValues: announcement.toJSON(),
        });

        res.status(201).json({ 
          message: 'Announcement created successfully', 
          announcement,
          success: true 
        });
      } catch (error) {
        console.error('❌ Error creating announcement:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('Full error:', error);
        
        res.status(500).json({ 
          error: 'Failed to create announcement',
          message: error.message,
          details: error.errors ? error.errors.map(e => e.message) : undefined
        });
      }
    });

    // ✅ Get announcements feed
    router.get('/', authenticate, async (req, res) => {
      try {
        const { type, priority, sort } = req.query;
        const where = {};

        if (type) where.type = type;
        if (priority) where.priority = priority;

        const announcements = await Announcement.findAll({
          where,
          order: [
            ['isPinned', 'DESC'],
            [sort || 'publishedAt', 'DESC'],
          ],
        });

        res.json(announcements || []);
      } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
      }
    });

    // ✅ Get announcement by ID
    router.get('/:announcementId', authenticate, async (req, res) => {
      try {
        const announcement = await Announcement.findByPk(req.params.announcementId);
        if (!announcement) {
          return res.status(404).json({ error: 'Announcement not found' });
        }

        // Increment view count
        announcement.viewCount += 1;
        await announcement.save();

        res.json(announcement);
      } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // ✅ Update announcement
    router.put('/:announcementId', authenticate, async (req, res) => {
      try {
        const announcement = await Announcement.findByPk(req.params.announcementId);
        if (!announcement) {
          return res.status(404).json({ error: 'Announcement not found' });
        }

        // if (announcement.authorId !== req.user.id && req.user.role !== 'admin') {
        //   return res.status(403).json({ error: 'Unauthorized' });
        // }

        const { title, content, type, priority, visibility } = req.body;

        if (title) announcement.title = title;
        if (content) announcement.content = content;
        if (type) announcement.type = type;
        if (priority) announcement.priority = priority;
        if (visibility) announcement.visibility = visibility;

        announcement.updatedAt = new Date();
        await announcement.save();

        await logAudit({
          userId: req.user.id,
          action: 'UPDATE',
          entityType: 'announcement',
          entityId: announcement.id,
          description: `Updated announcement: ${announcement.title}`,
        });

        res.json({ message: 'Announcement updated successfully', announcement });
      } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // ✅ Toggle pin announcement
    router.put('/:announcementId/pin', authenticate, async (req, res) => {
      try {
        // if (req.user.role !== 'admin' && req.user.role !== 'department_head') {
        //   return res.status(403).json({ error: 'Unauthorized' });
        // }

        const announcement = await Announcement.findByPk(req.params.announcementId);
        if (!announcement) {
          return res.status(404).json({ error: 'Announcement not found' });
        }

        announcement.isPinned = !announcement.isPinned;
        await announcement.save();

        await logAudit({
          userId: req.user.id,
          action: 'UPDATE',
          entityType: 'announcement',
          entityId: announcement.id,
          description: `${announcement.isPinned ? 'Pinned' : 'Unpinned'} announcement`,
        });

        res.json({ message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully`, announcement });
      } catch (error) {
        console.error('Error toggling pin:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // ✅ Delete announcement
    router.delete('/:announcementId', authenticate, async (req, res) => {
      try {
        const announcement = await Announcement.findByPk(req.params.announcementId);
        if (!announcement) {
          return res.status(404).json({ error: 'Announcement not found' });
        }

        // if (announcement.authorId !== req.user.id && req.user.role !== 'admin') {
        //   return res.status(403).json({ error: 'Unauthorized' });
        // }

        await announcement.destroy();

        await logAudit({
          userId: req.user.id,
          action: 'DELETE',
          entityType: 'announcement',
          entityId: announcement.id,
          description: `Deleted announcement: ${announcement.title}`,
        });

        res.json({ message: 'Announcement deleted successfully' });
      } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // ✅ Generate PDF for announcement
    router.get('/:announcementId/pdf', authenticate, async (req, res) => {
      try {
        const PDFDocument = require('pdfkit');
        const announcement = await Announcement.findByPk(req.params.announcementId);
        
        if (!announcement) {
          return res.status(404).json({ error: 'Announcement not found' });
        }

        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="announcement-${announcement.id}.pdf"`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('📢 Announcement', { align: 'center' });
        doc.moveDown(0.5);
        doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        // Title
        doc.fontSize(16).font('Helvetica-Bold').text(announcement.title);
        doc.moveDown(0.5);

        // Metadata
        doc.fontSize(10).font('Helvetica').fillColor('#666666');
        doc.text(`Author: ${announcement.authorName}`, { indent: 0 });
        doc.text(`Date: ${new Date(announcement.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        doc.text(`Type: ${announcement.type}`);
        doc.text(`Priority: ${announcement.priority}`);
        doc.text(`Visibility: ${announcement.visibility}`);
        doc.moveDown(1);

        // Content
        doc.fontSize(11).font('Helvetica').fillColor('#000000');
        doc.text(announcement.content, { align: 'left', lineGap: 5 });
        doc.moveDown(1);

        // Footer
        doc.fontSize(9).fillColor('#999999').text('Generated from Learnflow • Announcement System', { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

        doc.end();

        await announcement.increment('viewCount');
      } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
      }
    });

    return router;
  };
