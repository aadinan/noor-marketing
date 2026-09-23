const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Wipro Lighting"
  contactPerson: String,
  email: String,
  phone: String,
  gstNumber: String,
  address: String,
  
  // Terms
  creditPeriodDays: { type: Number, default: 30 }, // How long do THEY give you to pay?
  
  // Performance Tracking
  activeProducts: { type: Number, default: 0 },
  totalPurchasedValue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);