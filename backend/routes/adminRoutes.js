const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeAdmin, getAdminStats);

module.exports = router;
