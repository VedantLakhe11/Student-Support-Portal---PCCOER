const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    msg: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Bell',
    },
    iconColor: {
      type: String,
      default: '#3b82f6',
    },
    color: {
      type: String,
      default: 'rgba(59, 130, 246, 0.1)',
    },
    unread: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, unread: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
