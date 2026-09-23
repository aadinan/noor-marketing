const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  recipientRole: { type: String, enum: ['Boss', 'Manager', 'Admin', 'Salesman', 'Warehouse'] },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: String },
  relatedModel: { type: String },
  isRead: { type: Boolean, default: false, index: true }
}, { timestamps: true });
module.exports = mongoose.model('Notification', NotificationSchema);
