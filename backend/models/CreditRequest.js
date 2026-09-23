const mongoose = require('mongoose');

const CreditRequestSchema = new mongoose.Schema({
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The Salesman
  
  requestedAmount: { type: Number, required: true },
  currentLimit: { type: Number, required: true },
  
  reason: { type: String, required: true }, // e.g., "Big festival order coming up"
  
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  
  adminComment: { type: String }, // "Approved for this month only"
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The Admin
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('CreditRequest', CreditRequestSchema);