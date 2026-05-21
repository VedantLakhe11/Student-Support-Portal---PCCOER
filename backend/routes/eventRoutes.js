const express = require('express');
const { getEvents, createEvent, registerForEvent, getMyRegistrations, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getEvents)
  .post(protect, createEvent);

router.route('/:id')
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.get('/my-registrations', protect, getMyRegistrations);
router.post('/:id/register', protect, registerForEvent);

module.exports = router;
