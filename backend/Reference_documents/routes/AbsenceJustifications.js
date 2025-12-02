const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const NotificationClient = require('../../Service de Notifications/services/NotificationClient');

// Helper function to generate UUID v4
const uuidv4 = () => {
  return crypto.randomUUID();
};

// Configure multer for document uploads
const uploadsDir = path.join(__dirname, '../../uploads/justifications');
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

// Allow PDF, JPG, PNG only - max 10MB
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    const allowedExt = ['.pdf', '.jpg', '.jpeg', '.png'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  const { 
    AbsenceJustification, 
    StudentAbsence, 
    Schedule, 
    Matiere, 
    Classe,
    Student
  } = db.models || {};
  
  if (!AbsenceJustification || !StudentAbsence) {
    console.error('❌ AbsenceJustification or StudentAbsence model not found');
  }

  // ============================================
  // 📝 STUDENT: Submit Justification
  // ============================================
  router.post('/', authenticate, upload.single('document'), async (req, res) => {
    try {
      const { student_absence_id, title, explanation, justification_type } = req.body;

      // Validation
      if (!student_absence_id) {
        return res.status(400).json({ error: 'student_absence_id is required' });
      }
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }
      if (!explanation || !explanation.trim()) {
        return res.status(400).json({ error: 'Explanation is required' });
      }
      if (!justification_type) {
        return res.status(400).json({ error: 'Justification type is required' });
      }

      const validTypes = ['medical', 'family_issue', 'administrative', 'personal', 'other'];
      if (!validTypes.includes(justification_type)) {
        return res.status(400).json({ 
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
        });
      }

      // Fetch the StudentAbsence record
      const absence = await StudentAbsence.findByPk(student_absence_id);
      if (!absence) {
        return res.status(404).json({ error: 'Student absence record not found' });
      }

      // Verify that the student can only justify their own absences
      if (absence.student_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only justify your own absences' });
      }

      // Check if justification already exists for THIS SPECIFIC ABSENCE and is not rejected
      const existingJustification = await AbsenceJustification.findOne({
        where: { student_absence_id: student_absence_id }
      });

      if (existingJustification) {
        if (existingJustification.status === 'rejected') {
          // Allow resubmission if previously rejected
          console.log('✅ Previous justification was rejected, allowing resubmission');
        } else if (existingJustification.status === 'pending') {
          return res.status(400).json({ 
            error: 'A justification for this absence is already pending review',
            currentStatus: existingJustification.status,
            message: 'Veuillez attendre que votre justification précédente soit examinée'
          });
        } else if (existingJustification.status === 'approved') {
          return res.status(400).json({ 
            error: 'This absence has already been justified and approved',
            currentStatus: existingJustification.status,
            message: 'Cette absence a déjà été justifiée et approuvée'
          });
        } else if (existingJustification.status === 'revision_needed') {
          // Allow resubmission with revision
          console.log('✅ Previous justification needs revision, allowing resubmission');
        }
      }

      // Build document info
      const documentInfo = req.file ? {
        document_filename: req.file.originalname,
        document_path: `/uploads/justifications/${req.file.filename}`,
        document_size: req.file.size,
        document_mime_type: req.file.mimetype,
        document_uploaded_at: new Date()
      } : {};

      // Create justification
      const justification = await AbsenceJustification.create({
        id: uuidv4(),
        student_absence_id,
        student_id: absence.student_id,
        schedule_id: absence.schedule_id,
        matiere_id: absence.matiere_id || null,
        classe_id: absence.classe_id || null,
        title: title.trim(),
        explanation: explanation.trim(),
        justification_type,
        ...documentInfo,
        status: 'pending',
        submitted_at: new Date(),
        admin_notification_sent: false,
        student_notification_sent: false
      });

      // Log the action
      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'absence_justification',
        entityId: justification.id,
        description: `Student submitted justification for absence: ${title}${req.file ? ' (with document)' : ''}`,
        newValues: justification.toJSON()
      });

      // 🔔 Send notification to admins
      try {
        await NotificationClient.send({
          recipient_ids: [1], // Send to admin users - adjust based on your admin IDs
          type: 'justification_submitted',
          title: '📝 New Justification Submitted',
          content: `Student submitted a justification for absence: ${title}`,
          metadata: {
            justification_id: justification.id,
            student_id: absence.student_id,
            type: justification_type,
            timestamp: new Date().toISOString()
          },
          priority: 'high'
        });
      } catch (error) {
        console.warn('⚠️ Failed to send admin notification:', error.message);
      }
      justification.admin_notification_sent = true;
      await justification.save();

      res.status(201).json({ 
        message: 'Justification submitted successfully',
        justification,
        success: true
      });
    } catch (error) {
      console.error('❌ Error submitting justification:', error);
      res.status(500).json({ 
        error: 'Failed to submit justification',
        message: error.message
      });
    }
  });

  // ============================================
  // 📊 STATISTICS (MUST BE BEFORE PARAMETERIZED ROUTES)
  // ============================================
  router.get('/admin/statistics', authenticate, async (req, res) => {
    try {
      // Check admin role
      if (req.user.role !== 'admin' && req.user.role !== 'department_head' && req.user.role !== 'chef_departement') {
        console.log('❌ Unauthorized: User role is', req.user.role);
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { Op, fn, col } = require('sequelize');

      console.log('📊 Fetching justification statistics...');
      
      // Get status statistics
      const statusStats = await AbsenceJustification.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count']
        ],
        where: { 
          status: { [Op.ne]: 'deleted' }
        },
        group: ['status'],
        raw: true,
        subQuery: false
      }).catch(err => {
        console.error('❌ Error in status stats query:', err);
        return [];
      });

      // Get type statistics
      const typeStats = await AbsenceJustification.findAll({
        attributes: [
          'justification_type',
          [fn('COUNT', col('id')), 'count']
        ],
        where: { 
          status: { [Op.ne]: 'deleted' }
        },
        group: ['justification_type'],
        raw: true,
        subQuery: false
      }).catch(err => {
        console.error('❌ Error in type stats query:', err);
        return [];
      });

      // Transform status array to object with defaults
      const byStatus = {
        pending: 0,
        approved: 0,
        rejected: 0,
        revision_needed: 0
      };
      statusStats.forEach(stat => {
        if (stat && stat.status) {
          byStatus[stat.status] = parseInt(stat.count) || 0;
        }
      });

      // Transform type array to object with defaults
      const byType = {
        medical: 0,
        family_issue: 0,
        administrative: 0,
        personal: 0,
        other: 0
      };
      typeStats.forEach(type => {
        if (type && type.justification_type) {
          byType[type.justification_type] = parseInt(type.count) || 0;
        }
      });

      const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
      
      console.log(`✅ Statistics fetched successfully - Total: ${total}`);
      console.log('📊 By Status:', byStatus);
      console.log('📊 By Type:', byType);

      res.status(200).json({
        byStatus,
        byType,
        total,
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error fetching statistics:', error.message);
      console.error('❌ Stack:', error.stack);
      
      // Return fallback data instead of 500 error
      res.status(200).json({
        byStatus: {
          pending: 0,
          approved: 0,
          rejected: 0,
          revision_needed: 0
        },
        byType: {
          medical: 0,
          family_issue: 0,
          administrative: 0,
          personal: 0,
          other: 0
        },
        total: 0,
        success: true,
        warning: 'Using cached/default statistics due to temporary database issue',
        error: error.message
      });
    }
  });

  // ============================================
  // 👨‍🎓 STUDENT: Get My Justifications
  // ============================================
  router.get('/my-justifications', authenticate, async (req, res) => {
    try {
      console.log('🔍 Fetching justifications for student:', req.user.id, 'Type:', typeof req.user.id);
      
      if (!AbsenceJustification) {
        console.error('❌ AbsenceJustification model is not initialized');
        return res.status(500).json({ error: 'AbsenceJustification model not initialized' });
      }

      // Simple test query first
      console.log('📊 Attempting simple find query...');
      const justifications = await AbsenceJustification.findAll({
        where: { student_id: parseInt(req.user.id) }
      });

      console.log('✅ Found justifications:', justifications?.length || 0);
      res.json({ 
        data: justifications || [],
        success: true
      });
    } catch (error) {
      console.error('❌ Error fetching justifications:', error.message);
      console.error('❌ Full error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch justifications',
        message: error.message
      });
    }
  });

  // ============================================
  // 👨‍🎓 STUDENT: Get Single Justification
  // ============================================
  router.get('/my-justifications/:justificationId', authenticate, async (req, res) => {
    try {
      const justification = await AbsenceJustification.findByPk(req.params.justificationId);

      if (!justification) {
        return res.status(404).json({ error: 'Justification not found' });
      }

      // Verify ownership
      if (justification.student_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json(justification);
    } catch (error) {
      console.error('❌ Error fetching justification:', error);
      res.status(500).json({ error: 'Failed to fetch justification' });
    }
  });

  // ============================================
  // 👨‍🎓 STUDENT: Update Justification (before approval)
  // ============================================
  router.put('/my-justifications/:justificationId', authenticate, upload.single('document'), async (req, res) => {
    try {
      const justification = await AbsenceJustification.findByPk(req.params.justificationId);

      if (!justification) {
        return res.status(404).json({ error: 'Justification not found' });
      }

      // Verify ownership
      if (justification.student_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only modify your own justifications' });
      }

      // Can only edit if pending or revision_needed
      if (!['pending', 'revision_needed'].includes(justification.status)) {
        return res.status(400).json({ 
          error: `Cannot modify justification with status: ${justification.status}`
        });
      }

      const { title, explanation, justification_type } = req.body;

      // Update fields if provided
      if (title && title.trim()) justification.title = title.trim();
      if (explanation && explanation.trim()) justification.explanation = explanation.trim();
      if (justification_type) {
        const validTypes = ['medical', 'family_issue', 'administrative', 'personal', 'other'];
        if (validTypes.includes(justification_type)) {
          justification.justification_type = justification_type;
        }
      }

      // Update document if new one provided
      if (req.file) {
        // Delete old document if exists
        if (justification.document_path) {
          const oldPath = path.join(__dirname, '../../', justification.document_path);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        justification.document_filename = req.file.originalname;
        justification.document_path = `/uploads/justifications/${req.file.filename}`;
        justification.document_size = req.file.size;
        justification.document_mime_type = req.file.mimetype;
        justification.document_uploaded_at = new Date();
      }

      justification.last_modified_at = new Date();
      if (justification.status === 'revision_needed') {
        justification.status = 'pending';
      }

      await justification.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'absence_justification',
        entityId: justification.id,
        description: `Student updated justification: ${justification.title}`
      });

      res.json({ 
        message: 'Justification updated successfully',
        justification
      });
    } catch (error) {
      console.error('❌ Error updating justification:', error);
      res.status(500).json({ 
        error: 'Failed to update justification',
        message: error.message
      });
    }
  });

  // ============================================
  // 👨‍🎓 STUDENT: Delete Justification (before approval)
  // ============================================
  router.delete('/my-justifications/:justificationId', authenticate, async (req, res) => {
    try {
      const justification = await AbsenceJustification.findByPk(req.params.justificationId);

      if (!justification) {
        return res.status(404).json({ error: 'Justification not found' });
      }

      // Verify ownership
      if (justification.student_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only delete your own justifications' });
      }

      // Can only delete if pending or revision_needed
      if (!['pending', 'revision_needed'].includes(justification.status)) {
        return res.status(400).json({ 
          error: `Cannot delete justification with status: ${justification.status}`
        });
      }

      // Delete document if exists
      if (justification.document_path) {
        const docPath = path.join(__dirname, '../../', justification.document_path);
        if (fs.existsSync(docPath)) {
          fs.unlinkSync(docPath);
        }
      }

      const justificationId = justification.id;
      const justificationTitle = justification.title;

      await justification.destroy();

      await logAudit({
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'absence_justification',
        entityId: justificationId,
        description: `Student deleted justification: ${justificationTitle}`
      });

      res.json({ message: 'Justification deleted successfully' });
    } catch (error) {
      console.error('❌ Error deleting justification:', error);
      res.status(500).json({ 
        error: 'Failed to delete justification',
        message: error.message
      });
    }
  });

  // ============================================
  // 🔍 ADMIN: Get All Pending Justifications
  // ============================================
  router.get('/admin/pending', authenticate, async (req, res) => {
    try {
      // Check admin role
      if (req.user.role !== 'admin' && req.user.role !== 'department_head' && req.user.role !== 'chef_departement') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('📋 Fetching pending justifications...');
      const justifications = await AbsenceJustification.findAll({
        where: { status: 'pending' }
      });

      console.log(`✅ Found ${justifications.length} pending justifications`);
      res.json({ data: justifications || [], success: true });
    } catch (error) {
      console.error('❌ Error fetching pending justifications:', error);
      res.status(500).json({ error: 'Failed to fetch justifications', details: error.message });
    }
  });

  // ============================================
  // 🔍 ADMIN: Get All Justifications (with filters)
  // ============================================
  router.get('/admin/all', authenticate, async (req, res) => {
    try {
      // Check admin role
      if (req.user.role !== 'admin' && req.user.role !== 'department_head' && req.user.role !== 'chef_departement') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { status, student_id, page = 1, limit = 20 } = req.query;
      const where = {};

      if (status) where.status = status;
      if (student_id) where.student_id = parseInt(student_id);

      const offset = (parseInt(page) - 1) * parseInt(limit);

      console.log('📋 Fetching justifications with filters:', { status, student_id, page, limit });
      const { count, rows } = await AbsenceJustification.findAndCountAll({
        where,
        order: [['submitted_at', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      console.log(`✅ Found ${rows.length} justifications (total: ${count})`);
      res.json({
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / parseInt(limit))
        },
        success: true
      });
    } catch (error) {
      console.error('❌ Error fetching justifications:', error);
      res.status(500).json({ error: 'Failed to fetch justifications', details: error.message });
    }
  });

  // ============================================
  // ✅ ADMIN: Approve Justification
  // ============================================
  router.post('/:justificationId/approve', authenticate, async (req, res) => {
    try {
      // Check admin role
      if (req.user.role !== 'admin' && req.user.role !== 'department_head' && req.user.role !== 'chef_departement') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { notes } = req.body;
      const justification = await AbsenceJustification.findByPk(req.params.justificationId);

      if (!justification) {
        return res.status(404).json({ error: 'Justification not found' });
      }

      if (justification.status !== 'pending') {
        return res.status(400).json({ 
          error: `Cannot approve justification with status: ${justification.status}`
        });
      }

      // Update justification
      justification.status = 'approved';
      justification.reviewed_by = req.user.id;
      justification.review_date = new Date();
      if (notes) justification.review_notes = notes.trim();

      await justification.save();

      // Update StudentAbsence to mark as "justified" (if needed)
      const absence = await StudentAbsence.findByPk(justification.student_absence_id);
      if (absence) {
        // You might want to add a 'justified' field to StudentAbsence
        // For now, we'll create a relation
        absence.justification_status = 'justified';
        absence.updated_at = new Date();
        await absence.save();
      }

      await logAudit({
        userId: req.user.id,
        action: 'APPROVE',
        entityType: 'absence_justification',
        entityId: justification.id,
        description: `Approved justification: ${justification.title}`,
        newValues: { status: 'approved', notes }
      });

      // 🔔 Send notification to student
      try {
        await NotificationClient.send({
          recipient_id: justification.student_id,
          type: 'justification_approved',
          title: '✅ Justification Approved',
          content: 'Your absence justification has been approved.',
          metadata: {
            justification_id: justification.id,
            reviewed_by: req.user.id,
            notes: notes || '',
            timestamp: new Date().toISOString()
          },
          priority: 'high',
          action_url: `/absences/justifications/${justification.id}`
        });
      } catch (error) {
        console.warn('⚠️ Failed to send student notification:', error.message);
      }
      justification.student_notification_sent = true;
      await justification.save();

      res.json({
        message: 'Justification approved successfully',
        justification,
        studentNotification: '✔ Votre justification a été approuvée.'
      });
    } catch (error) {
      console.error('❌ Error approving justification:', error);
      res.status(500).json({ 
        error: 'Failed to approve justification',
        message: error.message
      });
    }
  });

  // ============================================
  // ❌ ADMIN: Reject Justification
  // ============================================
  router.post('/:justificationId/reject', authenticate, async (req, res) => {
    try {
      // Check admin role
      if (req.user.role !== 'admin' && req.user.role !== 'department_head' && req.user.role !== 'chef_departement') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { notes } = req.body;
      if (!notes || !notes.trim()) {
        return res.status(400).json({ error: 'Rejection reason (notes) is required' });
      }

      const justification = await AbsenceJustification.findByPk(req.params.justificationId);

      if (!justification) {
        return res.status(404).json({ error: 'Justification not found' });
      }

      if (justification.status !== 'pending') {
        return res.status(400).json({ 
          error: `Cannot reject justification with status: ${justification.status}`
        });
      }

      // Update justification
      justification.status = 'rejected';
      justification.reviewed_by = req.user.id;
      justification.review_date = new Date();
      justification.review_notes = notes.trim();

      await justification.save();

      await logAudit({
        userId: req.user.id,
        action: 'REJECT',
        entityType: 'absence_justification',
        entityId: justification.id,
        description: `Rejected justification: ${justification.title}`,
        newValues: { status: 'rejected', notes }
      });

      // 🔔 Send notification to student
      try {
        await NotificationClient.send({
          recipient_id: justification.student_id,
          type: 'justification_rejected',
          title: '❌ Justification Rejected',
          content: `Your absence justification has been rejected. Reason: ${notes}`,
          metadata: {
            justification_id: justification.id,
            reviewed_by: req.user.id,
            reason: notes,
            timestamp: new Date().toISOString()
          },
          priority: 'high',
          action_url: `/absences/justifications/${justification.id}`
        });
      } catch (error) {
        console.warn('⚠️ Failed to send student notification:', error.message);
      }
      justification.student_notification_sent = true;
      await justification.save();

      res.json({
        message: 'Justification rejected successfully',
        justification,
        studentNotification: `❌ Votre justification a été rejetée. Raison: ${notes}`
      });
    } catch (error) {
      console.error('❌ Error rejecting justification:', error);
      res.status(500).json({ 
        error: 'Failed to reject justification',
        message: error.message
      });
    }
  });

  // ============================================
  // ❓ ADMIN: Request More Information
  // ============================================
  router.post('/:justificationId/request-revision', authenticate, async (req, res) => {
    try {
      // Check admin role
      if (req.user.role !== 'admin' && req.user.role !== 'department_head' && req.user.role !== 'chef_departement') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Revision request message is required' });
      }

      const justification = await AbsenceJustification.findByPk(req.params.justificationId);

      if (!justification) {
        return res.status(404).json({ error: 'Justification not found' });
      }

      if (justification.status !== 'pending') {
        return res.status(400).json({ 
          error: `Cannot request revision for justification with status: ${justification.status}`
        });
      }

      // Update justification
      justification.status = 'revision_needed';
      justification.revision_request_message = message.trim();
      justification.revision_request_date = new Date();

      await justification.save();

      await logAudit({
        userId: req.user.id,
        action: 'REQUEST_REVISION',
        entityType: 'absence_justification',
        entityId: justification.id,
        description: `Requested revision for justification: ${justification.title}`,
        newValues: { status: 'revision_needed', message }
      });

      // 🔔 Send notification to student
      try {
        await NotificationClient.send({
          recipient_id: justification.student_id,
          type: 'justification_revision_requested',
          title: '❓ Revision Requested',
          content: `More information is needed for your justification. Message: ${message}`,
          metadata: {
            justification_id: justification.id,
            revision_message: message,
            timestamp: new Date().toISOString()
          },
          priority: 'medium',
          action_url: `/absences/justifications/${justification.id}`
        });
      } catch (error) {
        console.warn('⚠️ Failed to send student notification:', error.message);
      }
      justification.student_notification_sent = true;
      await justification.save();

      res.json({
        message: 'Revision requested successfully',
        justification,
        studentNotification: `❓ Plus d'informations sont nécessaires. Message: ${message}`
      });
    } catch (error) {
      console.error('❌ Error requesting revision:', error);
      res.status(500).json({ 
        error: 'Failed to request revision',
        message: error.message
      });
    }
  });

  // ============================================
  // 🔓 ADMIN/CHEF: Override Decision
  // ============================================
  router.post('/:justificationId/override', authenticate, async (req, res) => {
    try {
      // Check chef_departement role
      if (req.user.role !== 'chef_departement' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Chef Département or Admin access required' });
      }

      const { action, notes } = req.body; // action: 'approve' or 'reject'
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
      }

      const justification = await AbsenceJustification.findByPk(req.params.justificationId);

      if (!justification) {
        return res.status(404).json({ error: 'Justification not found' });
      }

      if (justification.status === 'deleted') {
        return res.status(400).json({ error: 'Cannot override deleted justification' });
      }

      // Update justification
      const oldStatus = justification.status;
      justification.status = action === 'approve' ? 'approved' : 'rejected';
      justification.reviewed_by = req.user.id;
      justification.review_date = new Date();
      if (notes) justification.review_notes = `[OVERRIDE by ${req.user.role}] ${notes.trim()}`;

      await justification.save();

      await logAudit({
        userId: req.user.id,
        action: 'OVERRIDE',
        entityType: 'absence_justification',
        entityId: justification.id,
        description: `${req.user.role} overrode decision: ${justification.title} from ${oldStatus} to ${justification.status}`,
        oldValues: { status: oldStatus },
        newValues: { status: justification.status, notes }
      });

      res.json({
        message: `Decision overridden to ${action}`,
        justification
      });
    } catch (error) {
      console.error('❌ Error overriding decision:', error);
      res.status(500).json({ 
        error: 'Failed to override decision',
        message: error.message
      });
    }
  });

  // ============================================
  // 📄 ADMIN/STUDENT: Download Document
  // ============================================
  router.get('/:justificationId/document', authenticate, async (req, res) => {
    try {
      const justification = await AbsenceJustification.findByPk(req.params.justificationId);

      if (!justification) {
        return res.status(404).json({ error: 'Justification not found' });
      }

      // Check authorization
      if (justification.student_id !== req.user.id && 
          req.user.role !== 'admin' && 
          req.user.role !== 'department_head' &&
          req.user.role !== 'chef_departement') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (!justification.document_path) {
        return res.status(404).json({ error: 'No document attached' });
      }

      const docPath = path.join(__dirname, '../../', justification.document_path);
      
      if (!fs.existsSync(docPath)) {
        return res.status(404).json({ error: 'Document file not found' });
      }

      // Set headers for file download
      res.setHeader('Content-Type', justification.document_mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${justification.document_filename}"`);
      res.setHeader('Content-Length', justification.document_size);

      // Stream the file
      const fileStream = fs.createReadStream(docPath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download document' });
        }
      });
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Failed to download document',
          message: error.message
        });
      }
    }
  });

  return router;
};
