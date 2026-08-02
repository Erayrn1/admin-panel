const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Get all logs
router.get('/', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { type, action, userId, startDate, endDate, limit = 50, page = 1 } = req.query;
    let query = {};

    if (type) query.type = type;
    if (action) query.action = action;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'username email');

    const total = await Log.countDocuments(query);

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});

// Get log by ID
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).populate('userId', 'username email');
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching log', error: error.message });
  }
});

// Create log entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, action, description, ipAddress, userAgent, metadata } = req.body;

    if (!type || !action) {
      return res.status(400).json({ message: 'Type and action are required' });
    }

    const log = new Log({
      type,
      action,
      description: description || '',
      userId: req.user?.id || null,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('user-agent'),
      metadata: metadata || {}
    });

    await log.save();
    res.status(201).json({ message: 'Log created successfully', log });
  } catch (error) {
    res.status(500).json({ message: 'Error creating log', error: error.message });
  }
});

// Get logs by type
router.get('/type/:type', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await Log.find({ type: req.params.type })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'username email');

    const total = await Log.countDocuments({ type: req.params.type });

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});

// Get logs by user
router.get('/user/:userId', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await Log.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'username email');

    const total = await Log.countDocuments({ userId: req.params.userId });

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});

// Clear old logs (older than specified days)
router.delete('/clear/:days', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Log.deleteMany({ createdAt: { $lt: date } });

    res.status(200).json({
      message: `Logs older than ${days} days deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing logs', error: error.message });
  }
});

// Get log statistics
router.get('/stats/overview', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const stats = await Log.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const actionStats = await Log.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      typeStats: stats,
      actionStats: actionStats,
      totalLogs: await Log.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;
