const Suggestion = require('../models/Suggestion');
const Event = require('../models/Event');
const Mentor = require('../models/Mentor');
const Book = require('../models/Book');
const Facility = require('../models/Facility');
const User = require('../models/User');

// ==========================================
// 1. SUGGESTIONS MODULE
// ==========================================

// @desc    Submit a new suggestion
// @route   POST /api/university/suggestions
// @access  Private (Student)
const createSuggestion = async (req, res, next) => {
  try {
    const { title, description, category, isAnonymous } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error('Please fill in suggestion title and details');
    }

    const suggestion = await Suggestion.create({
      studentId: req.user._id,
      studentName: req.user.name,
      title,
      description,
      category: category || 'Other',
      isAnonymous: !!isAnonymous,
    });

    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully',
      data: suggestion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all suggestions
// @route   GET /api/university/suggestions
// @access  Private
const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });

    // Enforce student anonymity for non-admin requests
    const sanitized = suggestions.map(s => {
      const doc = s.toObject();
      if (doc.isAnonymous && req.user.role !== 'admin') {
        doc.studentId = undefined;
        doc.studentName = 'Anonymous Student';
      }
      return doc;
    });

    res.json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote a suggestion
// @route   POST /api/university/suggestions/:id/vote
// @access  Private
const voteSuggestion = async (req, res, next) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);

    if (!suggestion) {
      res.status(404);
      throw new Error('Suggestion not found');
    }

    // Toggle vote
    const userIndex = suggestion.votedUsers.indexOf(req.user._id);
    if (userIndex === -1) {
      // Add upvote
      suggestion.votedUsers.push(req.user._id);
      suggestion.votes += 1;
    } else {
      // Remove upvote
      suggestion.votedUsers.splice(userIndex, 1);
      suggestion.votes = Math.max(0, suggestion.votes - 1);
    }

    await suggestion.save();

    res.json({
      success: true,
      message: 'Vote toggled successfully',
      votes: suggestion.votes,
      hasVoted: userIndex === -1,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. EVENTS & HACKATHONS
// ==========================================

// @desc    Get all upcoming events
// @route   GET /api/university/events
// @access  Private
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for a campus event
// @route   POST /api/university/events/:id/register
// @access  Private
const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check if already registered
    if (event.registeredStudents.includes(req.user._id)) {
      res.status(400);
      throw new Error('You have already registered for this event');
    }

    // Check slots
    if (event.registeredStudents.length >= event.slots) {
      res.status(400);
      throw new Error('Sorry, all reservation slots are completely filled.');
    }

    event.registeredStudents.push(req.user._id);
    await event.save();

    res.json({
      success: true,
      message: `Successfully registered for "${event.title}"! See you at ${event.location}.`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new campus event
// @route   POST /api/university/events
// @access  Private (Admin / Faculty)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, category, slots, emoji } = req.body;

    if (!title || !description || !date) {
      res.status(400);
      throw new Error('Please fill in title, description, and date');
    }

    const emojis = { Coding: '💻', Hackathon: '🚀', Cultural: '🎭', Sports: '⚽', Workshop: '🛠️', Seminar: '🎤' };
    const colors = {
      Coding: 'from-blue-500 to-indigo-500',
      Hackathon: 'from-orange-500 to-amber-600',
      Cultural: 'from-purple-500 to-indigo-500',
      Sports: 'from-emerald-500 to-teal-600',
      Workshop: 'from-pink-500 to-rose-500',
      Seminar: 'from-violet-500 to-fuchsia-600',
    };

    const event = await Event.create({
      title,
      description,
      date,
      location: location || 'PCCOER Seminar Hall',
      category: category || 'Workshop',
      slots: slots || 50,
      emoji: emoji || emojis[category] || '📅',
      color: colors[category] || 'from-slate-500 to-slate-600',
      organizer: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. MENTOR & ALUMNI INTERACTION
// ==========================================

// @desc    Get all active mentors
// @route   GET /api/university/mentors
// @access  Private
const getMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find().populate('userId', 'email avatar dept year');
    res.json({
      success: true,
      data: mentors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a mentorship request
// @route   POST /api/university/mentors/:id/request
// @access  Private (Student)
const requestMentorship = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400);
      throw new Error('Please enter a brief introduction message');
    }

    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      res.status(404);
      throw new Error('Mentor profile not found');
    }

    // Check duplicate request
    const existing = mentor.requests.find(r => r.studentId.toString() === req.user._id.toString() && r.status === 'Pending');
    if (existing) {
      res.status(400);
      throw new Error('You already have a pending request with this mentor');
    }

    mentor.requests.push({
      studentId: req.user._id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      message,
    });

    await mentor.save();

    res.json({
      success: true,
      message: 'Mentorship request sent successfully! You will hear back soon.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post placement guide blog
// @route   POST /api/university/mentors/blog
// @access  Private (Alumni / Faculty)
const postPlacementExperience = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      res.status(400);
      throw new Error('Please fill in both title and guidance content');
    }

    const mentor = await Mentor.findOne({ userId: req.user._id });
    if (!mentor) {
      res.status(404);
      throw new Error('Mentor profile not found for this user.');
    }

    mentor.guidanceBlogs.push({ title, content, category });
    await mentor.save();

    res.status(201).json({
      success: true,
      message: 'Guidance blog posted successfully!',
      data: mentor.guidanceBlogs,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. LIBRARY BOOKS
// ==========================================

// @desc    Get/Search library books
// @route   GET /api/university/books
// @access  Private
const getBooks = async (req, res, next) => {
  try {
    const query = req.query.search;
    let books;

    if (query) {
      books = await Book.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ],
      });
    } else {
      books = await Book.find().sort({ title: 1 });
    }

    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reserve a library book
// @route   POST /api/university/books/:id/reserve
// @access  Private
const reserveBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    // Check if copy is available
    if (book.available <= 0) {
      res.status(400);
      throw new Error('No physical copies currently available. You have been added to the waitlist alert list.');
    }

    // Check if user already holds active reservation
    const active = book.reservations.find(r => r.studentId.toString() === req.user._id.toString() && r.status === 'Active');
    if (active) {
      res.status(400);
      throw new Error('You have already reserved a copy of this book.');
    }

    book.reservations.push({
      studentId: req.user._id,
      studentName: req.user.name,
    });

    book.available = Math.max(0, book.available - 1);
    await book.save();

    res.json({
      success: true,
      message: `Successfully reserved "${book.title}"! Please pick it up from shelf: ${book.rack} within 48 hours.`,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new catalogue book
// @route   POST /api/university/books
// @access  Private (Admin / Faculty)
const createBook = async (req, res, next) => {
  try {
    const { title, author, category, total, rack } = req.body;

    if (!title || !author) {
      res.status(400);
      throw new Error('Please fill in title and author');
    }

    const emojis = ['📘', '📗', '📙', '📕', '📓', '📔'];
    const colors = [
      'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400',
      'from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400',
      'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
      'from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400',
      'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400',
    ];

    const book = await Book.create({
      title,
      author,
      category: category || 'Computer Engineering',
      total: total || 5,
      available: total || 5,
      rack: rack || 'Rack A, Shelf 1',
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    res.status(201).json({
      success: true,
      message: 'Book cataloged successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. CAMPUS FACILITIES
// ==========================================

// @desc    Get all facilities
// @route   GET /api/university/facilities
// @access  Private
const getFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find();
    res.json({
      success: true,
      data: facilities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a campus facility
// @route   POST /api/university/facilities/:id/book
// @access  Private
const bookFacility = async (req, res, next) => {
  try {
    const { purpose, bookingDate } = req.body;

    if (!purpose || !bookingDate) {
      res.status(400);
      throw new Error('Please fill in booking purpose and selected date');
    }

    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      res.status(404);
      throw new Error('Facility not found');
    }

    if (facility.status !== 'Operational') {
      res.status(400);
      throw new Error('This facility is currently offline for maintenance.');
    }

    facility.bookings.push({
      studentId: req.user._id,
      studentName: req.user.name,
      purpose,
      bookingDate,
    });

    await facility.save();

    res.status(201).json({
      success: true,
      message: `Facility reservation request for "${facility.name}" submitted! Waiting for admin department approval.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
