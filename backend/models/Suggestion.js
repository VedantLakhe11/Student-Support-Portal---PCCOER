const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a suggestion title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a suggestion description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Academics', 'Infrastructure', 'Events', 'Digital', 'Canteen', 'Other'],
      default: 'Other',
    },
    votes: {
      type: Number,
      default: 0,
    },
    votedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Under Review', 'Approved', 'Implemented', 'Spam'],
      default: 'Under Review',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Suggestion', suggestionSchema);
