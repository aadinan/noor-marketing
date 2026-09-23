const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true }, // PO-2026-001
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Your Warehouse Manager

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    orderedQty: { type: Number, required: true },
    receivedQty: { type: Number, default: 0 }, // Tracks partial delivery
    
    unitCost: { type: Number, required: true }, // Your buying price
    totalCost: { type: Number, required: true }
  }],

  totalAmount: { type: Number, required: true },
  
  status: { 
    type: String, 
    enum: ['DRAFT', 'SENT', 'PARTIAL', 'COMPLETED', 'CANCELLED'], 
    default: 'DRAFT' 
  },
  
  expectedDelivery: Date,
  receivedDate: Date

}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);