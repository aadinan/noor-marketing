const mongoose = require('mongoose');

console.log("✅ Retailer Model Loaded Correctly"); // This proves you are using the new file

const RetailerSchema = new mongoose.Schema({
  // --- REQUIRED FIELDS ---
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  gstNumber: { type: String, required: true, unique: true }, 
  
  address: {
    line1: { type: String }, 
    city: { type: String, required: true } 
  },

  assignedSalesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // --- OPTIONAL FIELDS ---
  incentiveStaffName: { type: String, default: "" },
  incentiveStaffPhone: { type: String, default: "" },
  incentiveTarget: { type: Number, default: 0 }, 
  incentivePercentage: { type: Number, default: 0 }, 

  // --- FINANCIALS ---
  outstandingBalance: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 10000 },

  // --- STATUS ---
  isActive: { type: Boolean, default: true },
  creditFrozen: { type: Boolean, default: false },
  freezeReason: { type: String, default: '' },
  tagName: { type: String, default: '' },

  // --- VISIT TRACKING ---
  lastVisitDate: { type: Date },
  lastOrderDate: { type: Date },
  visitCount: { type: Number, default: 0 },

  // --- GPS ---
  gpsLocation: {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number }
  },

  // --- METRICS ---
  metrics: {
    averagePaymentDays: { type: Number, default: 30 },
    averageMonthlySales: { type: Number, default: 0 },
    lastReviewDate: { type: Date }
  }

}, { timestamps: true });

// 🚨 CRITICAL: Ensure NO code exists below this line!
// Do NOT add any .pre('save') hooks here.

module.exports = mongoose.model('Retailer', RetailerSchema);