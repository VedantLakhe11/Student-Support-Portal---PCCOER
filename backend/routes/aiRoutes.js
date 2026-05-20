const express = require('express');
const router = express.Router();
const { chatWithAssistant, analyzeComplaint } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure AI endpoints

router.post('/chat', chatWithAssistant);
router.post('/analyze-complaint', analyzeComplaint);

module.exports = router;
