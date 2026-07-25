const Report = require('../models/Report');

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!['post', 'comment', 'user'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    const existingReport = await Report.findOne({
      reporter: req.userId,
      targetType,
      targetId,
      status: 'pending',
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this' });
    }

    const report = new Report({
      reporter: req.userId,
      targetType,
      targetId,
      reason,
    });

    await report.save();

    res.status(201).json({ message: 'Report submitted', report });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createReport };
