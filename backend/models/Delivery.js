const mongoose = require('mongoose');
const DeliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true },
  status: { type: String, enum: ['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'], default: 'PENDING', index: true },
  deliveredAt: { type: Date },
  paymentCollected: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Cheque', 'Credit'], default: 'Credit' },
  driverNotes: { type: String },
  proofDescription: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Delivery', DeliverySchema);
