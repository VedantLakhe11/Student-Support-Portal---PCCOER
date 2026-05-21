const express = require('express');
const router = express.Router();
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');
const {
  createSuggestion,
  getSuggestions,
  voteSuggestion,
  getMentors,
  requestMentorship,
  postPlacementExperience,
  getBooks,
  reserveBook,
  createBook,
  getFacilities,
  bookFacility,
  resolveFacilityBooking,
} = require('../controllers/universityController');

// Suggestions
router.post('/suggestions', protect, createSuggestion);
router.get('/suggestions', protect, getSuggestions);
router.post('/suggestions/:id/vote', protect, voteSuggestion);



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
router.put('/facilities/:id/bookings/:bookingId', protect, authorizeAdmin, resolveFacilityBooking);

module.exports = router;
