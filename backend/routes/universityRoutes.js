const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createSuggestion,
  getSuggestions,
  voteSuggestion,
  getEvents,
  registerForEvent,
  createEvent,
  getMentors,
  requestMentorship,
  postPlacementExperience,
  getBooks,
  reserveBook,
  createBook,
  getFacilities,
  bookFacility,
} = require('../controllers/universityController');

// Suggestions
router.post('/suggestions', protect, createSuggestion);
router.get('/suggestions', protect, getSuggestions);
router.post('/suggestions/:id/vote', protect, voteSuggestion);

// Events
router.get('/events', protect, getEvents);
router.post('/events', protect, createEvent);
router.post('/events/:id/register', protect, registerForEvent);

// Mentorship & Alumni
router.get('/mentors', protect, getMentors);
router.post('/mentors/:id/request', protect, requestMentorship);
router.post('/mentors/blog', protect, postPlacementExperience);

// Library Books
router.get('/books', protect, getBooks);
router.post('/books', protect, createBook);
router.post('/books/:id/reserve', protect, reserveBook);

// Campus Facilities
router.get('/facilities', protect, getFacilities);
router.post('/facilities/:id/book', protect, bookFacility);

module.exports = router;
