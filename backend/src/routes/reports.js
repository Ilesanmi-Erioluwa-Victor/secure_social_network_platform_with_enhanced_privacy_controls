const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/', auth, [
  body('targetType').isIn(['post', 'comment', 'user']),
  body('targetId').notEmpty().withMessage('Target ID required'),
  body('reason').trim().isLength({ min: 1, max: 1000 }).withMessage('Reason required'),
], validate, reportController.createReport);

module.exports = router;
