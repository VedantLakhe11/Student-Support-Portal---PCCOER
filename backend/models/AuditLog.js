const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true, // e.g. "BAN_USER", "ROLE_CHANGE", "DELETE_POST", "APPROVE_SUGGESTION"
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    details: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // timestamps not needed since we have custom index timestamp
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
