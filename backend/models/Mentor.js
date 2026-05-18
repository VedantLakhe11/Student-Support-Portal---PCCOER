const mongoose = require('mongoose');

const guidanceBlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Placement Experience', 'Internship Tips', 'Project Guidance', 'Core Engineering'],
    default: 'Placement Experience',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const mentorshipRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const mentorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'Software Engineer',
    },
    company: {
      type: String,
      required: true,
      default: 'PCCOER Alumni Network',
    },
    skills: {
      type: [String],
      default: ['Web Development', 'System Design'],
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    guidanceBlogs: [guidanceBlogSchema],
    requests: [mentorshipRequestSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Mentor', mentorSchema);
