const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    default: 'Student',
  },
  text: {
    type: String,
    required: [true, 'Comment text cannot be empty'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const forumPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      default: 'Student',
    },
    body: {
      type: String,
      required: [true, 'Post content cannot be empty'],
      trim: true,
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    },
    tag: {
      type: String,
      enum: ['General', 'Placements', 'Technical', 'Events', 'Study Groups'],
      default: 'General',
    },
    tagColor: {
      type: String,
      default: '#3b82f6',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [forumCommentSchema],
  },
  {
    timestamps: true,
  }
);

// Speed up listings by tag or user
forumPostSchema.index({ tag: 1 });
forumPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
