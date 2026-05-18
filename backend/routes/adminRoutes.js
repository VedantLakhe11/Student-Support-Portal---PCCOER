const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserBan,
  changeUserRole,
  moderateSuggestion,
} = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeAdmin, getAdminStats);
router.get('/users', protect, authorizeAdmin, getAllUsers);
router.put('/users/:id/ban', protect, authorizeAdmin, toggleUserBan);
router.put('/users/:id/role', protect, authorizeAdmin, changeUserRole);
router.put('/suggestions/:id', protect, authorizeAdmin, moderateSuggestion);

module.exports = router;
