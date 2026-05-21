const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Forming', 'Ready', 'Approved'], default: 'Forming' }
}, { timestamps: true });

teamSchema.index({ event: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);
