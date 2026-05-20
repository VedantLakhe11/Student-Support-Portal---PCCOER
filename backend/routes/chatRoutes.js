const express = require('express');
const router = express.Router();
const {
  getConversations,
  createConversation,
  getMessages,
  postMessage,
  pinMessage,
  reactToMessage,
  getUsersList,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all chat routes

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', postMessage);
router.put('/messages/:id/pin', pinMessage);
router.post('/messages/:id/react', reactToMessage);
router.get('/users', getUsersList);

module.exports = router;
