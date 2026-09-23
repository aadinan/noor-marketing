const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },       // e.g., "USER_CREATED", "ORDER_DELETED"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who did it?
  targetId: { type: String },                     // The ID of the item affected
  details: { type: Object },                      // Extra info (e.g., old vs new values)
  ipAddress: { type: String }                     // Security tracking
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);