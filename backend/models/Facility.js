const mongoose = require('mongoose');

const facilityBookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: Date,
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

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please specify facility name'],
      unique: true,
    },
    icon: {
      type: String,
      default: 'Activity',
    },
    status: {
      type: String,
      enum: ['Operational', 'Maintenance', 'Closed'],
      default: 'Operational',
    },
    detail: {
      type: String,
      default: 'Available for student booking.',
    },
    bookings: [facilityBookingSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Facility', facilitySchema);
