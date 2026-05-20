const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  likePost,
  savePost,
  votePoll,
  addComment,
  reportPost,
  getTrendingTags,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all feed routes

router.get('/', getPosts);
router.post('/', createPost);
router.post('/:id/like', likePost);
router.post('/:id/save', savePost);
router.post('/:id/poll/:optionId/vote', votePoll);
router.post('/:id/comment', addComment);
router.post('/:id/report', reportPost);
router.get('/trending-tags', getTrendingTags);

module.exports = router;
