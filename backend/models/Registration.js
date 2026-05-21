const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // Null if individual event
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  qrCodeUrl: { type: String }, // For attendance
  attendance: { type: Boolean, default: false },
  certificateUrl: { type: String },
}, { timestamps: true });

registrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
