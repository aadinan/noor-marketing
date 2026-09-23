const cron = require('node-cron');
const Retailer = require('../models/Retailer');
const Order = require('../models/Order');

// CONFIGURATION
const GROWTH_RATE = 0.10; // Increase limit by 10%
const MAX_LIMIT_CAP = 500000; // Don't auto-increase beyond 5 Lakhs

const runCreditEngine = () => {
  // Schedule: Run every Sunday at Midnight (00:00)
  cron.schedule('0 0 * * 0', async () => {
    console.log("⚙️ CREDIT ENGINE: Starting Weekly Evaluation...");

    try {
      const retailers = await Retailer.find();

      for (const shop of retailers) {
        // 1. CHECK HEALTH: Is the shop currently overloaded?
        const usageRatio = shop.outstandingBalance / shop.creditLimit;

        // RULE: Only increase if they are using credit responsibly (e.g., not maxed out constantly)
        // If usage is below 90% and they have no "Blocked" status (future feature)
        if (usageRatio < 0.90) {
          
          // 2. CALCULATE NEW LIMIT
          const increaseAmount = shop.creditLimit * GROWTH_RATE;
          let newLimit = Math.floor(shop.creditLimit + increaseAmount);

          // Cap the limit
          if (newLimit > MAX_LIMIT_CAP) newLimit = MAX_LIMIT_CAP;

          // 3. APPLY UPDATE
          if (newLimit > shop.creditLimit) {
            console.log(`✅ UPGRADE: ${shop.shopName} | ₹${shop.creditLimit} -> ₹${newLimit}`);
            
            shop.creditLimit = newLimit;
            await shop.save();
          }
        } else {
          console.log(`⚠️ SKIPPED: ${shop.shopName} (High Usage: ${(usageRatio * 100).toFixed(1)}%)`);
        }
      }
      console.log("⚙️ CREDIT ENGINE: Weekly Run Complete.");

    } catch (err) {
      console.error("❌ CREDIT ENGINE FAILED:", err.message);
    }
  });
};

module.exports = runCreditEngine;