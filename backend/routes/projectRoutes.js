const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  requestToJoin,
  respondToRequest,
  getSkillMatches,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all project routes

router.get('/', getProjects);
router.post('/', createProject);
router.post('/:id/join', requestToJoin);
router.post('/:id/respond/:requestId', respondToRequest);
router.get('/matchmaking', getSkillMatches);

module.exports = router;
