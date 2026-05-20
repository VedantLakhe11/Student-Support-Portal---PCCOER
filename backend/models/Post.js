const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide content for the post'],
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', ''],
      default: '',
    },
    category: {
      type: String,
      enum: ['Placements', 'Clubs', 'Events', 'Announcements', 'Coding', 'Startups', 'Projects', 'General'],
      default: 'General',
      index: true,
    },
    poll: {
      question: {
        type: String,
        default: '',
      },
      options: [
        {
          text: {
            type: String,
            required: true,
          },
          votes: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
          ],
        },
      ],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hashtags: {
      type: [String],
      default: [],
    },
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reports: [
      {
        reporter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          default: 'Spam / Inappropriate',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isModerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
