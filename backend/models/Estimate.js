const mongoose = require('mongoose');
const EstimateSchema = new mongoose.Schema({
  estimateNumber: { type: String, required: true, unique: true },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer' },
  customerInfo: { name: String, phone: String, address: String, customerType: { type: String, enum: ['Retailer', 'Contractor', 'Direct Customer'], default: 'Direct Customer' } },
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subTotal: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  status: { type: String, enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CONVERTED'], default: 'DRAFT', index: true },
  convertedSalesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  validUntil: { type: Date },
  notes: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Estimate', EstimateSchema);
