const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');
const AuditLog = require('../models/AuditLog');

const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'pending';

    const reports = await Report.find({ status })
      .populate('reporter', 'name username')
      .populate('reviewedBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments({ status });

    res.json({
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.reviewedBy = req.userId;
    await report.save();

    await AuditLog.create({
      user: req.userId,
      action: `REPORT_${status.toUpperCase()}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { reportId: id, targetType: report.targetType, targetId: report.targetId },
    });

    res.json({ message: `Report ${status}`, report });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot suspend an admin' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    await AuditLog.create({
      user: req.userId,
      action: user.isSuspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { targetUserId: id },
    });

    res.json({
      message: user.isSuspended ? 'User suspended' : 'User reinstated',
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate('user', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      userCount,
      postCount,
      pendingReports,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getReports,
  reviewReport,
  suspendUser,
  getAuditLogs,
  getStats,
};
