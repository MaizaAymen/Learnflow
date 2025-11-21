const express = require('express');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { AuditLog } = db.models || {};
  
  if (!AuditLog) {
    console.error('❌ AuditLog model not found');
  }

  // ✅ Get all audit logs (Admin only)
  router.get('/', authenticate, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can view audit logs' });
      }

      const { action, entityType, userId, startDate, endDate, limit = 100 } = req.query;
      const where = {};

      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (userId) where.userId = userId;

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[require('sequelize').Op.gte] = new Date(startDate);
        if (endDate) where.timestamp[require('sequelize').Op.lte] = new Date(endDate);
      }

      const logs = await AuditLog.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit),
      });

      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get logs for entity
  router.get('/:entityType/:entityId', authenticate, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;

      const logs = await AuditLog.findAll({
        where: { entityType, entityId },
        order: [['timestamp', 'DESC']],
      });

      res.json(logs);
    } catch (error) {
      console.error('Error fetching entity logs:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get user activity logs
  router.get('/user/:userId', authenticate, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const logs = await AuditLog.findAll({
        where: { userId: req.params.userId },
        order: [['timestamp', 'DESC']],
        limit: 500,
      });

      res.json(logs);
    } catch (error) {
      console.error('Error fetching user logs:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get audit statistics
  router.get('/stats/summary', authenticate, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can view statistics' });
      }

      const totalLogs = await AuditLog.count();
      const actionCounts = await AuditLog.findAll({
        attributes: [
          'action',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        ],
        group: ['action'],
        raw: true,
      });

      const entityCounts = await AuditLog.findAll({
        attributes: [
          'entityType',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        ],
        group: ['entityType'],
        raw: true,
      });

      const stats = {
        totalLogs,
        actionCounts,
        entityCounts,
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
