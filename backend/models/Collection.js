const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // CLIENT INFO
  clientType: { type: String, enum: ['Shop', 'Contractor'], required: true },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer' }, // Required if Shop
  contractorName: { type: String }, // For direct contractor entry

  // PAYMENT DETAILS
  amountCollected: { type: Number, required: true },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Cheque', 'Bank Transfer', 'NEFT'], required: true },
  referenceNumber: { type: String, default: '' }, // Cheque No / UPI ID
  note: { type: String },

  // DISCOUNT LOGIC
  discountAsked: { type: Number, default: 0 },
  discountStatus: { 
    type: String, 
    enum: ['None', 'Auto-Approved', 'Pending_Approval', 'Manager_Approved', 'Rejected'],
    default: 'None'
  },

  // OFFLINE SYNC
  isOfflineEntry: { type: Boolean, default: false },
  syncedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Collection', CollectionSchema);