const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Please add an event title'], trim: true, maxlength: 100 },
    description: { type: String, required: [true, 'Please add an event description'], trim: true },
    eventType: { type: String, enum: ['Individual', 'Team'], default: 'Individual' },
    teamSize: { type: Number, default: 1 },
    date: { type: Date, required: [true, 'Please provide an event date'] },
    endDate: { type: Date },
    registrationDeadline: { type: Date },
    location: { type: String, required: true, default: 'PCCOER Seminar Hall' },
    category: { type: String, enum: ['Coding', 'Hackathon', 'Cultural', 'Sports', 'Workshop', 'Seminar'], default: 'Workshop' },
    slots: { type: Number, default: 50 },
    rules: [{ type: String }],
    prizes: [{ type: String }],
    facultyCoordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organizer: { type: String, default: 'PCCOER Admin' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: 'Approved' },
    color: { type: String, default: 'from-blue-500 to-indigo-500' },
    emoji: { type: String, default: '📅' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
