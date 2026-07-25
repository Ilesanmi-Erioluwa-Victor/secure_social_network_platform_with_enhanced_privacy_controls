const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/:username', auth, userController.getProfile);
router.patch('/me', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
], validate, userController.updateProfile);

router.patch('/me/privacy-settings', auth, [
  body('friendRequestWho').optional().isIn(['everyone', 'friends_of_friends', 'nobody']),
  body('showFriendsList').optional().isIn(['everyone', 'friends', 'only_me']),
  body('showEmail').optional().isIn(['everyone', 'friends', 'only_me']),
], validate, userController.updatePrivacySettings);

router.post('/:id/block', auth, userController.blockUser);
router.post('/:id/unblock', auth, userController.unblockUser);
router.get('/me/blocks', auth, userController.getBlockedUsers);
router.delete('/me', auth, userController.deleteAccount);
router.get('/me/data', auth, userController.downloadData);

module.exports = router;
