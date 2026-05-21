const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const sendEmail = require('../utils/email');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 }).populate('facultyCoordinator', 'name email');
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin / Faculty)
const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      facultyCoordinator: req.user._id,
      organizer: req.user.name,
      status: req.user.role === 'admin' ? 'Approved' : 'Pending',
    });

    res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'Approved') return res.status(400).json({ success: false, message: 'Event not active' });
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline passed' });
    }

    const existingReg = await Registration.findOne({ event: event._id, student: req.user._id });
    if (existingReg) return res.status(400).json({ success: false, message: 'Already registered' });

    let teamId = null;
    if (event.eventType === 'Team') {
      const { joinCode, teamName } = req.body;
      if (joinCode) {
        const team = await Team.findOne({ joinCode, event: event._id });
        if (!team) return res.status(404).json({ success: false, message: 'Invalid team code' });
        if (team.members.length >= event.teamSize) return res.status(400).json({ success: false, message: 'Team is full' });
        team.members.push(req.user._id);
        await team.save();
        teamId = team._id;
      } else if (teamName) {
        const team = await Team.create({
          name: teamName,
          event: event._id,
          leader: req.user._id,
          members: [req.user._id],
          joinCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        });
        teamId = team._id;
      } else {
        return res.status(400).json({ success: false, message: 'Team name or code required for team events' });
      }
    }

    const registration = await Registration.create({
      event: event._id,
      student: req.user._id,
      team: teamId,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${req.user._id}-${event._id}`
    });

    // Send confirmation email
    await sendEmail({
      email: req.user.email,
      subject: `Registration Confirmed: ${event.title}`,
      html: `<h2>You are registered!</h2><p>Event: ${event.title}</p><p>Location: ${event.location}</p><p>Time: ${new Date(event.date).toLocaleString()}</p>`
    });

    res.status(201).json({ success: true, data: registration, message: 'Successfully registered' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's registrations
// @route   GET /api/events/my-registrations
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const regs = await Registration.find({ student: req.user._id })
      .populate('event')
      .populate('team');
    res.json({ success: true, data: regs });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin / Faculty)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: event, message: 'Event updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    await event.deleteOne();
    res.json({ success: true, message: 'Event removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  registerForEvent,
  getMyRegistrations,
  updateEvent,
  deleteEvent
};
