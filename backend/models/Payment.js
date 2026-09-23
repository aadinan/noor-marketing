const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // Who gave money?
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true },
  // Who took money?
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  amount: { type: Number, required: true },
  
  method: { 
    type: String, 
    enum: ['CASH', 'CHEQUE', 'UPI', 'NEFT'], 
    required: true 
  },

  // --- SPECIFIC DETAILS ---
  transactionReference: { type: String }, // Cheque No. or UPI Transaction ID
  chequeDate: { type: Date },             // Important for Post-Dated Cheques (PDC)
  bankName: { type: String },             // For Cheques

  // --- PROOF ---
  imageUrl: { type: String }, // Photo of Cheque/Screenshot
  location: {                 // GPS Tagging
    lat: Number,
    lng: Number
  },

  // --- STATUS TRACKING ---
  status: { 
    type: String, 
    enum: ['COLLECTED', 'VERIFIED', 'BOUNCED', 'CLEARED'], 
    default: 'COLLECTED' 
  },
  
  // Link to specific Invoice (Optional - used if paying for a specific bill)
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);