const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Retailer = require('../models/Retailer');
const Product = require('../models/Product');

exports.getBossAnalytics = async (req, res) => {
  try {
    // 1. HEADLINES (The Big Numbers)
    const totalSales = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$netPayable" } } }]);
    const totalCollected = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalDebt = await Retailer.aggregate([{ $group: { _id: null, total: { $sum: "$outstandingBalance" } } }]);

    // 2. THE GRAPH DATA (Last 7 Days Trend)
    // We want an array like: [{ date: 'Mon', sales: 50000, collected: 40000 }, ...]
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          sales: { $sum: "$netPayable" } 
      }},
      { $sort: { _id: 1 } }
    ]);

    const collectionTrend = await Payment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          collected: { $sum: "$amount" } 
      }},
      { $sort: { _id: 1 } }
    ]);

    // Merge data for the Frontend Graph
    // (In a real app, use a proper date merger, simplified here)
    const graphData = salesTrend.map(s => {
      const c = collectionTrend.find(x => x._id === s._id);
      return {
        date: s._id,
        Sales: s.sales,
        Collection: c ? c.collected : 0
      };
    });

    res.json({
      headlines: {
        sales: totalSales[0]?.total || 0,
        collected: totalCollected[0]?.total || 0,
        debt: totalDebt[0]?.total || 0
      },
      graphData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Scientific Reorder Report - ABC Analysis of LOW stock items
// @route GET /api/analytics/reorder
// @access Private (Manager, Boss, Admin)
exports.getReorderReport = async (req, res) => {
  try {
    // Find all products where stock is at or below reorder level
    const lowStockProducts = await Product.find({
      $or: [
        { 'inventory.stockStatus': 'LOW' },
        { 'inventory.stockStatus': 'Out of Stock' },
        {
          $expr: {
            $lte: ['$inventory.stockCount', { $ifNull: ['$inventory.reorderLevel', 5] }]
          }
        }
      ]
    })
      .sort({ mrp: -1 }) // Highest value items first = A-Class proxy
      .select('name sku brand mrp inventory category');

    const total = lowStockProducts.length;

    if (total === 0) {
      return res.json({
        success: true,
        summary: { totalLowStock: 0, aClassCritical: 0, bClassHigh: 0, cClassNormal: 0 },
        aClass: [], bClass: [], cClass: [], shoppingList: []
      });
    }

    // ABC Classification: A=top 20%, B=next 30%, C=bottom 50%
    const aClassCount = Math.max(1, Math.ceil(total * 0.2));
    const bClassCount = Math.max(1, Math.ceil(total * 0.3));

    const classified = lowStockProducts.map((p, i) => {
      let classification = 'C';
      if (i < aClassCount) classification = 'A';
      else if (i < aClassCount + bClassCount) classification = 'B';

      const currentStock = p.inventory?.stockCount || 0;
      const reorderLevel = p.inventory?.reorderLevel || 10;
      const suggestedOrderQty = Math.max((reorderLevel * 2) - currentStock, reorderLevel);

      return {
        _id: p._id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        category: p.category,
        mrp: p.mrp,
        currentStock,
        reorderLevel,
        stockStatus: p.inventory?.stockStatus || 'LOW',
        classification,
        urgency: classification === 'A' ? 'CRITICAL' : classification === 'B' ? 'HIGH' : 'NORMAL',
        suggestedOrderQty
      };
    });

    const aClass = classified.filter(p => p.classification === 'A');
    const bClass = classified.filter(p => p.classification === 'B');
    const cClass = classified.filter(p => p.classification === 'C');

    res.json({
      success: true,
      summary: {
        totalLowStock: total,
        aClassCritical: aClass.length,
        bClassHigh: bClass.length,
        cClassNormal: cClass.length
      },
      aClass,
      bClass,
      cClass,
      shoppingList: aClass.map(p => ({
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        currentStock: p.currentStock,
        reorderQty: p.suggestedOrderQty,
        estimatedCost: p.mrp * p.suggestedOrderQty,
        urgency: 'CRITICAL'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};