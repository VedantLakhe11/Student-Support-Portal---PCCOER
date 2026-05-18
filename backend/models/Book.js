const mongoose = require('mongoose');

const bookReservationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  reservedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'Returned'],
    default: 'Active',
  },
});

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please specify book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please specify book author'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify branch department category'],
      default: 'Computer Engineering',
    },
    available: {
      type: Number,
      default: 5,
    },
    total: {
      type: Number,
      default: 5,
    },
    rack: {
      type: String,
      default: 'Rack A, Shelf 1',
    },
    emoji: {
      type: String,
      default: '📘',
    },
    color: {
      type: String,
      default: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    },
    reservations: [bookReservationSchema],
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: 'text', author: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
