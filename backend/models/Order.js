const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // --- 1. PEOPLE INVOLVED ---
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true },

  // --- 2. THE CART (With Warehouse Logic) ---
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    
    // Financials
    wholesalePriceAtTime: { type: Number, required: true }, // Locks price to prevent future changes affecting history
    subTotal: { type: Number, required: true },
    
    // --- NEW: WAREHOUSE SNAPSHOT ---
    // This string (e.g., "Zone 1 > Rack A") is saved when order is placed.
    // It helps the warehouse staff create a "Pick List" instantly.
    locationSnap: { type: String, default: 'Unassigned' } 
  }],

  // --- 3. MONEY MATTERS ---
  totalOrderValue: { type: Number, required: true }, // Gross Total
  discountApplied: { type: Number, default: 0 },     // Cash discount
  netPayable: { type: Number, required: true },      // The actual bill amount

  // --- 4. HIDDEN INCENTIVE TRACKING (Internal Only) ---
  staffIncentiveAmount: { type: Number, default: 0 }, // e.g., 2% of Total

  // --- 5. LOGISTICS STATUS ---
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true // Indexed for fast dashboard filtering
  },

  // --- 6. APPROVAL TRACKING ---
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: { type: String },
  geofenceVerified: { type: Boolean, default: false },

  // --- 7. RECEIPT ---
  whatsappSent: { type: Boolean, default: false },

  // --- LOGISTICS & SITE DELIVERY ---
  deliveryInfo: {
    isSiteDelivery: { type: Boolean, default: false }, // Checkbox
    
    siteName: { type: String }, // e.g., "Green Valley Villa #45"
    siteContactName: { type: String }, // Who will receive it? (Watchman/Supervisor)
    siteContactPhone: { type: String },
    
    // The Exact GPS Location for the Driver
    locationCoordinates: {
      lat: Number,
      lng: Number,
      googleMapLink: String // "https://maps.google.com/?q=..."
    },
    
    // Specific instructions
    instructions: { type: String } // "Gate is locked, call before entering"
  },
  
  

}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);