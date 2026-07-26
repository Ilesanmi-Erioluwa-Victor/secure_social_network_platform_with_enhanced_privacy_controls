const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/conversations', auth, messageController.getConversations);
router.post('/:userId', auth, [
  body('ciphertext').notEmpty().withMessage('Ciphertext required'),
  body('nonce').notEmpty().withMessage('Nonce required'),
], validate, messageController.sendMessage);

router.get('/unread/count', auth, messageController.getUnreadCount);
router.get('/:userId', auth, messageController.getMessages);

module.exports = router;
