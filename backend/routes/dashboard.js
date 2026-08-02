const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Contact = require('../models/Contact');
const Log = require('../models/Log');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Get dashboard overview
router.get('/overview', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Contact.countDocuments();
    const totalLogs = await Log.countDocuments();
    
    const unreadMessages = await Contact.countDocuments({ isRead: false });
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingMessages = await Contact.countDocuments({ status: 'pending' });

    const recentMessages = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentLogs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'username email');

    res.status(200).json({
      stats: {
        totalUsers,
        totalMessages,
        totalLogs,
        unreadMessages,
        activeUsers,
        pendingMessages
      },
      recentActivity: {
        messages: recentMessages,
        logs: recentLogs
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard overview', error: error.message });
  }
});

// Get user statistics
router.get('/users/stats', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const moderatorUsers = await User.countDocuments({ role: 'moderator' });
    const userRoleUsers = await User.countDocuments({ role: 'user' });

    const usersLastWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: {
        admin: adminUsers,
        moderator: moderatorUsers,
        user: userRoleUsers
      },
      newUsersLastWeek: usersLastWeek
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user statistics', error: error.message });
  }
});

// Get message statistics
router.get('/messages/stats', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ isRead: false });
    const readMessages = await Contact.countDocuments({ isRead: true });
    const pendingMessages = await Contact.countDocuments({ status: 'pending' });
    const repliedMessages = await Contact.countDocuments({ status: 'replied' });
    const resolvedMessages = await Contact.countDocuments({ status: 'resolved' });

    const messagesByCategory = await Contact.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const messagesLastWeek = await Contact.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      total: totalMessages,
      byStatus: {
        unread: unreadMessages,
        read: readMessages,
        pending: pendingMessages,
        replied: repliedMessages,
        resolved: resolvedMessages
      },
      byCategory: messagesByCategory,
      messagesLastWeek: messagesLastWeek
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching message statistics', error: error.message });
  }
});

// Get activity timeline
router.get('/activity/timeline', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const userActivity = await User.countDocuments({
      updatedAt: { $gte: startDate }
    });

    const messageActivity = await Contact.countDocuments({
      createdAt: { $gte: startDate }
    });

    const logActivity = await Log.countDocuments({
      createdAt: { $gte: startDate }
    });

    const dailyStats = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      timeRange: {
        days,
        startDate,
        endDate: new Date()
      },
      activity: {
        users: userActivity,
        messages: messageActivity,
        logs: logActivity
      },
      dailyStats: dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity timeline', error: error.message });
  }
});

// Get top contributors/active users
router.get('/users/top-active', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topUsers = await Log.aggregate([
      {
        $group: {
          _id: '$userId',
          activityCount: { $sum: 1 }
        }
      },
      {
        $sort: { activityCount: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      }
    ]);

    res.status(200).json(topUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top active users', error: error.message });
  }
});

// Get system health
router.get('/system/health', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const dbConnected = true; // Assume connected if we can query
    const usersCount = await User.countDocuments();
    const messagesCount = await Contact.countDocuments();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date(),
      server: {
        uptime: uptime,
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
        }
      },
      database: {
        connected: dbConnected,
        collections: {
          users: usersCount,
          messages: messagesCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Error fetching system health', 
      error: error.message 
    });
  }
});

// Get recent activity (combined)
router.get('/recent-activity', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentUsers = await User.find()
      .sort({ updatedAt: -1 })
      .limit(Math.floor(limit / 3))
      .select('username email role isActive createdAt updatedAt');

    const recentMessages = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 3))
      .select('name email subject status createdAt');

    const recentLogs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 3))
      .populate('userId', 'username email');

    const activity = [
      ...recentUsers.map(u => ({ type: 'user', data: u, timestamp: u.updatedAt })),
      ...recentMessages.map(m => ({ type: 'message', data: m, timestamp: m.createdAt })),
      ...recentLogs.map(l => ({ type: 'log', data: l, timestamp: l.createdAt }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent activity', error: error.message });
  }
});

module.exports = router;
