const express = require('express');
const { uuidv4 } = require('../utils/uuidGenerator');
const NotificationClient = require('../../Service de Notifications/services/NotificationClient');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { StudentRequest } = db.models || {};
  
  if (!StudentRequest) {
    console.error('❌ StudentRequest model not found');
  }

  // ✅ Create student request
  router.post('/', authenticate, async (req, res) => {
    try {
      const { type, title, description, attachments, priority, department } = req.body;

      if (!type || !title || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const request = await StudentRequest.create({
        id: uuidv4(),
        studentId: req.user.id,
        type,
        title,
        description,
        attachments: attachments || [],
        priority: priority || 'medium',
        status: 'pending',
        department: department || null,
        submittedAt: new Date(),
      });

      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'request',
        entityId: request.id,
        description: `Student created request: ${type} - ${title}`,
        newValues: request.toJSON(),
      });

      res.status(201).json({ message: 'Request submitted successfully', request });
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get my requests (for students)
  router.get('/my-requests', authenticate, async (req, res) => {
    try {
      const requests = await StudentRequest.findAll({
        where: { studentId: req.user.id },
        order: [['submittedAt', 'DESC']],
      });

      res.json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get all requests (Admin/Department Head)
  router.get('/', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'admin' && req.user.role !== 'department_head') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const { status, type, priority } = req.query;
      const where = {};

      if (status) where.status = status;
      if (type) where.type = type;
      if (priority) where.priority = priority;

      const requests = await StudentRequest.findAll({
        where,
        order: [['priority', 'DESC'], ['submittedAt', 'DESC']],
      });

      res.json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get request by ID
  router.get('/:requestId', authenticate, async (req, res) => {
    try {
      const request = await StudentRequest.findByPk(req.params.requestId);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Students can only see their own requests
      // if (req.user.role === 'student' && request.studentId !== req.user.id) {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      res.json(request);
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Update request status (Admin/Department Head)
  router.put('/:requestId/status', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'admin' && req.user.role !== 'department_head') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const request = await StudentRequest.findByPk(req.params.requestId);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      const { status, response, responseFile } = req.body;

      request.status = status;
      if (response) request.response = response;
      if (responseFile) request.responseFile = responseFile;
      if (status === 'completed' || status === 'approved' || status === 'rejected') {
        request.resolvedAt = new Date();
        request.responseDate = new Date();
      }
      if (!request.assignedTo) {
        request.assignedTo = req.user.id;
      }

      await request.save();

      // 🔔 Send notification to student about request status change
      try {
        const statusMessages = {
          'approved': '✅ Your request has been approved',
          'rejected': '❌ Your request has been rejected',
          'completed': '✅ Your request has been completed',
          'in_review': '👀 Your request is under review',
          'pending': '⏳ Your request is pending'
        };

        const notificationTitle = statusMessages[status] || `Request Status: ${status}`;
        const priority = ['approved', 'rejected', 'completed'].includes(status) ? 'high' : 'medium';

        await NotificationClient.send({
          recipient_id: request.studentId,
          type: `request_${status}`,
          title: notificationTitle,
          content: response || `Your ${request.type} request has been ${status}`,
          metadata: {
            request_id: request.id,
            request_type: request.type,
            old_status: request.status,
            new_status: status,
            response: response || '',
            timestamp: new Date().toISOString()
          },
          priority: priority,
          action_url: `/requests/${request.id}`
        });
      } catch (notifError) {
        console.warn('⚠️ Failed to send request status notification:', notifError.message);
      }

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'request',
        entityId: request.id,
        description: `Updated request status to: ${status}`,
      });

      res.json({ message: 'Request updated successfully', request });
    } catch (error) {
      console.error('Error updating request:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Assign request to staff
  router.put('/:requestId/assign', authenticate, async (req, res) => {
    try {
      // if (req.user.role !== 'admin' && req.user.role !== 'department_head') {
      //   return res.status(403).json({ error: 'Unauthorized' });
      // }

      const { assignedTo } = req.body;
      const request = await StudentRequest.findByPk(req.params.requestId);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      request.assignedTo = assignedTo;
      request.status = 'in_review';
      await request.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'request',
        entityId: request.id,
        description: `Assigned request to staff member`,
      });

      res.json({ message: 'Request assigned successfully', request });
    } catch (error) {
      console.error('Error assigning request:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
