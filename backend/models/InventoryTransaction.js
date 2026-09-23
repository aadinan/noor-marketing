const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['INWARD', 'OUTWARD', 'TRANSFER', 'ADJUSTMENT', 'RETURN'],
    required: true
  },
  quantity: { type: Number, required: true }, // e.g., +50 or -10
  
  // Logic for Warehouse mapping changes
  fromLocation: String, // "Zone 1 > Rack A"
  toLocation: String,   // "Zone 1 > Rack B" (Used for transfers)

  reason: { type: String, default: 'General' }, // "Sales", "Damaged", "Truck Arrived"
  referenceId: String, // Order ID or Invoice Number
}, { timestamps: true });

module.exports = mongoose.model('InventoryTransaction', InventoryTransactionSchema);