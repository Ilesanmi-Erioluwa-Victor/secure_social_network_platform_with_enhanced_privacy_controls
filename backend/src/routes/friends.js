const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', auth, friendController.getFriends);
router.get('/requests', auth, friendController.getFriendRequests);
router.post('/request/:id', auth, friendController.sendFriendRequest);
router.patch('/:id/respond', auth, [
  body('status').isIn(['accepted', 'rejected']),
], validate, friendController.respondToFriendRequest);

router.delete('/:id', auth, friendController.unfriend);

module.exports = router;
