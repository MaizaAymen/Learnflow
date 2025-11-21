const express = require('express');
const multer = require('multer');
const path = require('path');
const { uuidv4 } = require('../utils/uuidGenerator');
const fs = require('fs');
const sequelize = require('../../auth-service/config');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { Document } = db.models || {};
  
  if (!Document) {
    console.error('❌ Document model not found');
  }

  const uploadDir = path.join(__dirname, '../uploads/documents');
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
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'video/mp4',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    },
  });

  // ✅ Upload document
  router.post('/', authenticate, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { title, description, courseId, type, visibleTo, dueDate, tags } = req.body;

      console.log('📄 Document upload request:', { title, type, courseId, userId: req.user.id, userIdType: typeof req.user.id });

      if (!title || !type) {
        return res.status(400).json({ error: 'Missing required fields: title or type' });
      }

      // Handle INTEGER to UUID conversion for uploadedBy
      let uploadedBy;
      const userId = req.user.id;
      if (Number.isInteger(userId)) {
        const paddedId = String(userId).padStart(8, '0');
        uploadedBy = `00000000-0000-0000-0000-${paddedId.padStart(12, '0')}`;
        console.log('✅ Converted INTEGER user ID to UUID:', uploadedBy);
      } else if (typeof userId === 'string') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(userId)) {
          uploadedBy = userId;
        } else {
          return res.status(400).json({ error: 'Invalid user ID format' });
        }
      } else {
        return res.status(400).json({ error: 'Invalid user ID type' });
      }

      const docId = uuidv4();
      const now = new Date();

      console.log('💾 Creating document with data:', { id: docId, title, uploadedBy });

      // Use Sequelize ORM instead of raw SQL
      const document = await Document.create({
        id: docId,
        title,
        description: description || null,
        courseId: (courseId && courseId !== 'undefined') ? parseInt(courseId) : null,
        type,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy,
        uploadedAt: now,
        isPublic: visibleTo !== 'class_only',
        downloadCount: 0,
        visibleTo: visibleTo || 'class_only',
        dueDate: (dueDate && dueDate !== 'undefined') ? dueDate : null,
        tags: Array.isArray(tags) ? tags : (tags ? JSON.parse(tags) : []),
        createdAt: now,
        updatedAt: now
      }, {
        validate: false,
        individualHooks: false
      });

      console.log('✅ Document uploaded:', docId);

      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'document',
        entityId: document ? document.id : docId,
        description: `Uploaded document: ${title}`,
        newValues: document ? document.toJSON() : { id: docId }
      });

      res.status(201).json({ message: 'Document uploaded successfully', document });
    } catch (error) {
      console.error('❌ Error uploading document:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // ✅ Get all documents
  router.get('/', authenticate, async (req, res) => {
    try {
      const { courseId, type, visibleTo } = req.query;
      const where = {};

      console.log('📚 Fetching documents:', { courseId, type, visibleTo });

      // Ensure courseId is treated as integer if provided
      if (courseId) where.courseId = parseInt(courseId);
      if (type) where.type = type;
      if (visibleTo) where.visibleTo = visibleTo;

      const documents = await Document.findAll({
        where,
        order: [['uploadedAt', 'DESC']],
      });

      console.log(`✅ Found ${documents.length} documents`);
      res.json(documents);
    } catch (error) {
      console.error('❌ Error fetching documents:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // ✅ Get document by ID
  router.get('/:docId', authenticate, async (req, res) => {
    try {
      const document = await Document.findByPk(req.params.docId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      document.downloadCount += 1;
      await document.save();

      res.json(document);
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Download document
  router.get('/:docId/download', authenticate, async (req, res) => {
    try {
      const document = await Document.findByPk(req.params.docId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      document.downloadCount += 1;
      await document.save();

      res.download(document.filePath);
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Update document
  router.put('/:docId', authenticate, async (req, res) => {
    try {
      const document = await Document.findByPk(req.params.docId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // if (document.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const { title, description, visibleTo, dueDate, tags } = req.body;

      if (title) document.title = title;
      if (description) document.description = description;
      if (visibleTo) document.visibleTo = visibleTo;
      if (dueDate) document.dueDate = dueDate;
      if (tags) document.tags = tags;

      await document.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'document',
        entityId: document.id,
        description: `Updated document: ${document.title}`,
      });

      res.json({ message: 'Document updated successfully', document });
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Delete document
  router.delete('/:docId', authenticate, async (req, res) => {
    try {
      const document = await Document.findByPk(req.params.docId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // if (document.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      await document.destroy();

      await logAudit({
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'document',
        entityId: document.id,
        description: `Deleted document: ${document.title}`,
      });

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
