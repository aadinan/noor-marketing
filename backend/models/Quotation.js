const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  // --- CLIENT INFO (Retailer OR Direct Customer) ---
  retailer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Retailer', 
    required: false // Optional, because it might be a direct customer
  },
  
  customerInfo: {
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    customerType: { 
      type: String, 
      enum: ['Retailer', 'Contractor', 'Direct Customer'], 
      default: 'Direct Customer' 
    }
  },

  quotationNumber: { type: String, required: true, unique: true }, // Auto-generated
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // --- ITEMS & PRICING ---
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    
    // Pricing Logic
    quotedPrice: { type: Number, required: true }, // The price salesman offered
    basePrice: { type: Number, required: true },   // HIDDEN: The cost price (for margin check)
    subTotal: { type: Number, required: true }
  }],

  totalAmount: { type: Number, required: true }, // Net Total
  grandTotal: { type: Number, required: true },  // With Tax

  // --- FLOWCHART LOGIC: APPROVALS ---
  marginStatus: { 
    type: String, 
    enum: ['Healthy', 'Low_Margin'], 
    default: 'Healthy' 
  },

  status: { 
    type: String, 
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'EXPIRED'], 
    default: 'DRAFT' 
  },

  validUntil: { type: Date, required: true },
  terms: { type: String, default: "Prices valid for 7 days." },
  convertedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }

}, { timestamps: true });

module.exports = mongoose.model('Quotation', QuotationSchema);