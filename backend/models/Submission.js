const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  githubLink: { type: String },
  demoVideo: { type: String },
  presentationUrl: { type: String },
  abstract: { type: String },
  score: { type: Number, default: 0 },
  feedback: { type: String },
  isWinner: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
