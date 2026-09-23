const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // --- 1. IDENTITY ---
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  productCode: { type: String, required: true, index: true }, // Catalog Number
  name: { type: String, required: true }, 
  brand: { type: String, required: true, index: true }, 
  category: { type: String, required: true, index: true }, 

  // --- 2. PRICING ---
  basePrice: { type: Number, required: true }, // Wholesale Price
  mrp: { type: Number, required: true }, 
  isActive: { type: Boolean, default: true },

  // --- 3. WAREHOUSE & INVENTORY ---
  inventory: {
    stockCount: { type: Number, default: 0 },
    packagingQty: { type: Number, default: 1 },
    location: {
      zone: { type: String, required: true },
      rack: { type: String, default: 'General' },
      shelf: { type: String, default: 'Floor' },
      bin: { type: String, default: '' }
    },
    physicalPath: { type: String }, 
    alertLevel: { type: Number, default: 10 },
    maxCapacity: { type: Number, default: 500 },
    restockStatus: { 
      type: String, 
      enum: ['OK', 'LOW', 'CRITICAL', 'OVERSTOCK'], 
      default: 'OK' 
    }
  },

  // --- 4. SPECIFICATIONS ---
  specifications: {
    // Lighting (Wipro)
    wattage: String,      
    lumens: String,       
    cct: String,          
    cutoutInch: Number,   
    beamAngle: String,    
    ipRating: String,     
    driverType: String,   
    diameterMm: Number,   
    heightMm: Number,     

    // ✅ NEW ADDITIONS (Lighting)
    driverAmp: String,    // e.g. "0.5A"
    mountingType: { 
    type: String, 
    enum: ['Open', 'Concealed', 'None'], // ✅ Added 'None'
    default: 'None' // ✅ Changed default to 'None'  
     },

    // Switchgear (Teso)
    modules: String,      
    ampere: String,       
    pins: Number,         
    material: String,     
    indicator: Boolean,   
    boxType: String       
  },

  // --- 5. SCIENTIFIC METRICS ---
  metrics: {
    classification: { type: String, enum: ['A', 'B', 'C', 'Dead'], default: 'C' },
    averageDailySales: { type: Number, default: 0 },
    leadTimeDays: { type: Number, default: 7 },
    safetyStock: { type: Number, default: 5 },
    reorderPoint: { type: Number, default: 10 },
    lastAnalyzed: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// --- 6. SMART MIDDLEWARE LOGIC ---

// A: Auto-Generate Physical Path
ProductSchema.pre('save', async function() {
  const loc = this.inventory.location;
  let path = `${loc.zone} > ${loc.rack} > ${loc.shelf}`;
  if (loc.bin) path += ` > ${loc.bin}`;
  this.inventory.physicalPath = path;
});

// B: Auto-Calculate Stock Health
ProductSchema.pre('save', async function() {
  const current = this.inventory.stockCount;
  const max = this.inventory.maxCapacity;
  const dangerZone = this.metrics.reorderPoint || this.inventory.alertLevel;

  if (current === 0) {
    this.inventory.restockStatus = 'CRITICAL';
  } else if (current <= dangerZone) {
    this.inventory.restockStatus = 'LOW';
  } else if (current > max) {
    this.inventory.restockStatus = 'OVERSTOCK';
  } else {
    this.inventory.restockStatus = 'OK';
  }
});

// --- 7. INDEXES ---
ProductSchema.index({ 'inventory.location.zone': 1 });
ProductSchema.index({ 'inventory.restockStatus': 1 });
ProductSchema.index({ 'metrics.classification': 1 });
ProductSchema.index({ 
  name: 'text', 
  sku: 'text', 
  brand: 'text',
  productCode: 'text'
}, {
  weights: { name: 10, sku: 5, brand: 3, productCode: 2 } 
});

module.exports = mongoose.model('Product', ProductSchema);