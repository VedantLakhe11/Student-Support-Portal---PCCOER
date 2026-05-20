const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserBan,
  changeUserRole,
  moderateSuggestion,
  getModerationQueue,
  moderateReportedPost,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeAdmin, getAdminStats);
router.get('/users', protect, authorizeAdmin, getAllUsers);
router.put('/users/:id/ban', protect, authorizeAdmin, toggleUserBan);
router.put('/users/:id/role', protect, authorizeAdmin, changeUserRole);
router.put('/suggestions/:id', protect, authorizeAdmin, moderateSuggestion);

// Moderation Queue & Logs
router.get('/moderation/queue', protect, authorizeAdmin, getModerationQueue);
router.post('/moderation/posts/:id', protect, authorizeAdmin, moderateReportedPost);
router.get('/moderation/logs', protect, authorizeAdmin, getAuditLogs);

module.exports = router;
