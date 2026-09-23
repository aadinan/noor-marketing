const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Runs Scientific Analysis on All Products
 * 1. Calculates Velocity (Daily Sales)
 * 2. Classifies into A (Fast), B (Medium), C (Slow)
 * 3. Updates Reorder Points dynamically
 */
const runInventoryAnalysis = async () => {
  console.log("Starting Scientific Inventory Analysis...");

  const products = await Product.find();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Alerts Collection (To send to frontend)
  let alerts = [];

  for (let product of products) {
    // A. CALCULATE VELOCITY (Average Daily Sales)
    // Find all orders for this product in last 30 days
    const result = await Order.aggregate([
      { $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'Cancelled' },
          "items.product": product._id 
      }},
      { $unwind: "$items" },
      { $match: { "items.product": product._id } },
      { $group: { _id: null, totalQty: { $sum: "$items.quantity" } } }
    ]);

    const totalSold = result.length > 0 ? result[0].totalQty : 0;
    const dailySales = totalSold / 30; // Simple Moving Average

    // B. CLASSIFY (ABC Analysis)
    // Rule: Fast > 1 unit/day, Medium > 0.3/day, Slow < 0.3, Dead = 0
    let classification = 'C';
    if (dailySales >= 1.0) classification = 'A';      // Fast Moving
    else if (dailySales >= 0.3) classification = 'B'; // Medium
    else if (dailySales > 0) classification = 'C';    // Slow
    else classification = 'Dead';                     // Dead Stock

    // C. CALCULATE DYNAMIC REORDER POINT (ROP)
    // Formula: (DailySales * LeadTime) + SafetyStock
    // Example: Sells 2/day. Takes 7 days to arrive. Safety 5.
    // ROP = (2 * 7) + 5 = 19.
    // Alert triggers when stock hits 19, NOT 0.
    const leadTime = product.metrics.leadTimeDays || 7;
    const safetyBuffer = product.metrics.safetyStock || 5;
    
    const newROP = Math.ceil((dailySales * leadTime) + safetyBuffer);

    // D. UPDATE PRODUCT
    product.metrics.averageDailySales = dailySales.toFixed(2);
    product.metrics.classification = classification;
    product.metrics.reorderPoint = newROP;
    product.metrics.lastAnalyzed = Date.now();
    
    // E. GENERATE ALERT?
    if (product.inventory.stockCount <= newROP && classification !== 'Dead') {
      alerts.push({
        product: product.name,
        sku: product.sku,
        currentStock: product.inventory.stockCount,
        reorderLevel: newROP,
        velocity: classification, // "Fast Moving! Urgent!"
        message: `Urgent! ${product.name} is Fast Moving (Class A) and below safe limit.`
      });
      
      // Auto-Update Status for Dashboard
      product.inventory.restockStatus = 'LOW';
    } else if (classification === 'Dead' && product.inventory.stockCount > 0) {
      product.inventory.restockStatus = 'OVERSTOCK';
    }

    await product.save();
  }

  console.log("Analysis Complete. Alerts generated:", alerts.length);
  return alerts;
};

module.exports = { runInventoryAnalysis };