const mongoose = require('mongoose');
const ProjectOrderSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  clientName: { type: String, required: true },
  clientType: { type: String, enum: ['Retailer', 'Contractor', 'Direct Customer'], required: true },
  siteAddress: { type: String, required: true },
  estimatedValue: { type: Number, required: true },
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer' },
  items: [{
    productName: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'pcs' },
    price: { type: Number, required: true },
    subTotal: { type: Number, required: true }
  }],
  discountPercent: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  requiresSiteDelivery: { type: Boolean, default: false },
  staggeredDelivery: { type: Boolean, default: false },
  milestones: [{ description: String, targetDate: Date, status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' } }],
  quotationStatus: { type: String, enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'], default: 'DRAFT', index: true },
  orderStatus: { type: String, enum: ['NOT_STARTED', 'ACTIVE', 'DISPATCHING', 'COMPLETED'], default: 'NOT_STARTED' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  siteToken: { type: String },
  notes: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('ProjectOrder', ProjectOrderSchema);
