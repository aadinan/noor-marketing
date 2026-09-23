const cron = require('node-cron');
const Retailer = require('../models/Retailer');
const Order = require('../models/Order');

/**
 * ------------------------------------------------------------------
 * 1. THE SCIENTIFIC FORMULA (The Brain)
 * Calculates the new limit based on Sales Volume & Payment Speed
 * ------------------------------------------------------------------
 */
const recalculateCreditLimit = async (retailer) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // --- A. NEW SHOP PROTECTION (Grace Period) ---
    // If shop is < 30 days old, do not recalculate. Keep default limit.
    const shopAgeDays = (Date.now() - new Date(retailer.createdAt)) / (1000 * 60 * 60 * 24);
    if (shopAgeDays < 30) {
      return retailer.creditLimit;
    }

    // --- B. GET SALES DATA (Scientific Volume Analysis) ---
    const salesHistory = await Order.aggregate([
      { 
        $match: { 
          retailer: retailer._id, 
          createdAt: { $gte: threeMonthsAgo },
          status: { $ne: 'Cancelled' } // Ignore cancelled orders
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          monthlyTotal: { $sum: "$netPayable" }
        }
      }
    ]);

    // Calculate Average Monthly Volume (AMV)
    const totalVolume = salesHistory.reduce((acc, curr) => acc + curr.monthlyTotal, 0);
    const activeMonths = salesHistory.length || 1; 
    const AMV = totalVolume / activeMonths;

    // --- C. GET PAYMENT SPEED (Risk Analysis) ---
    // Default to 30 days if metric is missing (Neutral score)
    const avgDays = retailer.metrics?.averagePaymentDays || 30; 
    
    // --- D. CALCULATE TRUST MULTIPLIER (Statistical Scoring) ---
    let multiplier = 1.0; // Standard

    if (avgDays <= 7) multiplier = 1.5;       // Super Star (Pays in a week)
    else if (avgDays <= 15) multiplier = 1.2; // Good
    else if (avgDays <= 30) multiplier = 1.0; // Standard
    else if (avgDays <= 45) multiplier = 0.8; // Slow
    else if (avgDays <= 60) multiplier = 0.6; // Risky
    else multiplier = 0.4;                    // Danger Zone

    // Bonus: Consistency Bonus (Bought consistently for 3 months)
    if (salesHistory.length >= 3) multiplier += 0.1;

    // --- E. FINAL FORMULA ---
    // Base Rule: Limit = 1.5x their Monthly Volume * Trust Multiplier
    let newLimit = (AMV * 1.5) * multiplier;

    // Safety Guards (Floor & Ceiling)
    if (newLimit < 5000) newLimit = 5000;       // Minimum Floor (Never go below ₹5k)
    if (newLimit > 500000) newLimit = 500000;   // Absolute Max Cap (Risk Control)

    // Round to nearest 100 for clean numbers
    newLimit = Math.ceil(newLimit / 100) * 100;

    // --- F. UPDATE RETAILER ---
    // Only save if the limit actually changed
    if (newLimit !== retailer.creditLimit) {
      console.log(`📊 UPDATING ${retailer.shopName}: ₹${retailer.creditLimit} -> ₹${newLimit} (AMV: ₹${AMV.toFixed(0)}, Speed: ${avgDays} days)`);
      
      retailer.creditLimit = newLimit;
      
      // Update metrics if they exist, or initialize them
      if (!retailer.metrics) retailer.metrics = {};
      retailer.metrics.averageMonthlySales = AMV;
      retailer.metrics.lastReviewDate = Date.now();
      
      await retailer.save();
    }

    return newLimit;

  } catch (err) {
    console.error(`❌ Error calculating limit for ${retailer.shopName}:`, err.message);
    return retailer.creditLimit;
  }
};

/**
 * ------------------------------------------------------------------
 * 2. THE SCHEDULER (The Heartbeat)
 * Runs the logic every Sunday at Midnight
 * ------------------------------------------------------------------
 */
const runCreditEngine = () => {
  // Cron Syntax: 0 0 * * 0 = At 00:00 on Sunday
  cron.schedule('0 0 * * 0', async () => {
    console.log("⚙️  CREDIT ENGINE: Starting Weekly Evaluation...");
    
    try {
      const retailers = await Retailer.find();
      console.log(`Checking ${retailers.length} shops...`);

      for (const shop of retailers) {
        await recalculateCreditLimit(shop);
      }
      
      console.log("⚙️  CREDIT ENGINE: Weekly Run Complete.");

    } catch (err) {
      console.error("❌ CREDIT ENGINE CRITICAL FAILURE:", err);
    }
  });
};

module.exports = runCreditEngine;