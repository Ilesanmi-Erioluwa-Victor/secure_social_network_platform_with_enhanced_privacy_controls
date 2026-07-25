const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const validate = require('../middleware/validate');

router.get('/reports', auth, requireRole('admin', 'moderator'), adminController.getReports);
router.patch('/reports/:id/review', auth, requireRole('admin', 'moderator'), [
  body('status').isIn(['reviewed', 'dismissed']),
], validate, adminController.reviewReport);

router.patch('/users/:id/suspend', auth, requireRole('admin'), adminController.suspendUser);
router.get('/audit-logs', auth, requireRole('admin'), adminController.getAuditLogs);
router.get('/stats', auth, requireRole('admin'), adminController.getStats);

module.exports = router;
