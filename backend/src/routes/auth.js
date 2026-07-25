const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { loginLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimit');

router.post('/register', registerLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('username').trim().isLength({ min: 3, max: 30 }).isAlphanumeric().withMessage('Username must be 3-30 alphanumeric characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, authController.register);

router.post('/verify-email', [
  body('token').notEmpty().withMessage('Token required'),
], validate, authController.verifyEmail);

router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, authController.login);

router.post('/mfa/verify', [
  body('tempToken').notEmpty().withMessage('Temporary token required'),
  body('mfaCode').isLength({ min: 6, max: 6 }).withMessage('Valid MFA code required'),
], validate, authController.verifyMFA);

router.post('/refresh', authController.refresh);
router.post('/logout', auth, authController.logout);

router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
], validate, authController.forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, authController.resetPassword);

module.exports = router;
