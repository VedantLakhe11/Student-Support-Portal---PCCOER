const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide an event date'],
    },
    location: {
      type: String,
      required: [true, 'Please specify the event location'],
      default: 'PCCOER Seminar Hall',
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['Coding', 'Hackathon', 'Cultural', 'Sports', 'Workshop', 'Seminar'],
      default: 'Workshop',
    },
    slots: {
      type: Number,
      default: 50,
    },
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    image: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'from-blue-500 to-indigo-500',
    },
    emoji: {
      type: String,
      default: '📅',
    },
    organizer: {
      type: String,
      default: 'PCCOER Admin',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
