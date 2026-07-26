const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/feed', auth, postController.getFeed);
router.get('/user/:userId', auth, postController.getUserPosts);
router.post('/', auth, [
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be 1-5000 characters'),
  body('visibility').optional().isIn(['public', 'friends', 'custom', 'only_me']),
], validate, postController.createPost);

router.patch('/:id/visibility', auth, [
  body('visibility').isIn(['public', 'friends', 'custom', 'only_me']),
], validate, postController.updatePostVisibility);

router.post('/:id/like', auth, postController.likePost);
router.post('/:id/comments', auth, [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1-2000 characters'),
], validate, postController.addComment);

router.get('/:id/comments', auth, postController.getComments);
router.get('/:id', auth, postController.getPostById);

module.exports = router;
