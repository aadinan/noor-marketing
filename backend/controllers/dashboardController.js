const Order = require('../models/Order');
const Product = require('../models/Product');
const Retailer = require('../models/Retailer');
const Quotation = require('../models/Quotation');
const CreditRequest = require('../models/CreditRequest');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Get Boss/Admin Dashboard Stats
// @route   GET /api/dashboard/boss
// @access  Private (Boss, Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$netPayable' },
          totalIncentives: { $sum: '$staffIncentiveAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Collections (Payments)
    const dailyCollections = await Payment.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$amount' }
        }
      }
    ]);

    // Outstanding Debts (from Retailers)
    const totalDebts = await Retailer.aggregate([
      { $group: { _id: null, outstanding: { $sum: '$outstandingBalance' } } }
    ]);

    const brandStats = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.brand',
          totalSold: { $sum: '$items.subTotal' },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } }
    ]);

    const lowStock = await Product.find({ 'inventory.stockCount': { $lt: 20 } })
      .select('name brand inventory sku')
      .limit(5);

    // 7-day Sales vs Collection trend for BossDashboard chart
    const graphData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const [dayOrders, dayPayments] = await Promise.all([
        Order.aggregate([{ $match: { createdAt: { $gte: day, $lte: dayEnd }, status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$netPayable' } } }]),
        Payment.aggregate([{ $match: { createdAt: { $gte: day, $lte: dayEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
      ]);

      graphData.push({
        date: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        Sales: dayOrders[0]?.total || 0,
        Collection: dayPayments[0]?.total || 0
      });
    }

    // 30/60/90 day aging ledger
    const agingLedger = {
      days30: 0,
      days60: 0,
      days90plus: 0
    };

    // Get orders older than 30 days where payment is still outstanding (status !== Delivered or outstanding > 0)
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const agingData = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled'] } } },
      {
        $group: {
          _id: null,
          days30: { $sum: { $cond: [{ $gte: ['$createdAt', thirtyDaysAgo] }, '$netPayable', 0] } },
          days60: { $sum: { $cond: [{ $and: [{ $gte: ['$createdAt', sixtyDaysAgo] }, { $lt: ['$createdAt', thirtyDaysAgo] }] }, '$netPayable', 0] } },
          days90plus: { $sum: { $cond: [{ $lt: ['$createdAt', ninetyDaysAgo] }, '$netPayable', 0] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      today: {
        revenue: dailyStats[0]?.totalRevenue || 0,
        incentivesOwed: dailyStats[0]?.totalIncentives || 0,
        orders: dailyStats[0]?.orderCount || 0,
        collected: dailyCollections[0]?.totalCollected || 0,
        outstandingDebts: totalDebts[0]?.outstanding || 0
      },
      brands: brandStats,
      inventoryAlerts: lowStock,
      graphData,
      agingLedger: agingData[0] || { days30: 0, days60: 0, days90plus: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Manager Dashboard Stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
exports.getManagerDashboard = async (req, res) => {
  try {
    const pendingQuotations = await Quotation.find({ status: 'PENDING_APPROVAL' }).populate('salesman', 'username').populate('retailer', 'shopName');
    const pendingCreditRequests = await CreditRequest.find({ status: 'PENDING' }).populate('retailer', 'shopName').populate('requestedBy', 'username');
    const pendingCreditOrders = await Order.find({ status: 'Pending' }).populate('retailer', 'shopName ownerName creditLimit outstandingBalance').populate('salesman', 'username');

    // Notifications for live spot-discounts (Quotations with Low_Margin)
    const spotDiscountRequests = await Quotation.find({ status: 'PENDING_APPROVAL', marginStatus: 'Low_Margin' }).populate('salesman', 'username').populate('retailer', 'shopName');

    res.json({
      success: true,
      pendingQuotations,
      pendingCreditRequests,
      pendingCreditOrders,
      spotDiscountRequests,
      counts: {
        quotations: pendingQuotations.length,
        creditRequests: pendingCreditRequests.length,
        pendingCreditOrders: pendingCreditOrders.length,
        spotDiscounts: spotDiscountRequests.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Warehouse Dashboard Stats
// @route   GET /api/dashboard/warehouse
// @access  Private (Warehouse)
exports.getWarehouseDashboard = async (req, res) => {
  try {
    // Order picking queue - populate both product and retailer
    const pendingOrders = await Order.find({ status: 'Pending' })
      .populate('retailer', 'shopName ownerName address')
      .populate('items.product', 'name sku inventory')
      .sort({ createdAt: 1 });

    // Count of processing/packed today could also be useful
    res.json({
      success: true,
      pendingOrders,
      queueCount: pendingOrders.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Salesman Dashboard Stats
// @route   GET /api/dashboard/salesman
// @access  Private (Salesman)
exports.getSalesmanDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({ salesman: req.user._id, createdAt: { $gte: today } })
      .populate('retailer', 'shopName');

    const payments = await Payment.find({ collectedBy: req.user._id, createdAt: { $gte: today } })
      .populate('retailer', 'shopName');

    const totalOrders = orders.reduce((acc, curr) => acc + curr.netPayable, 0);
    const totalCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      success: true,
      today: {
        totalOrdersValue: totalOrders,
        totalCollectedValue: totalCollected,
        orderCount: orders.length,
        paymentCount: payments.length
      },
      routingFlags: {
        canAddOrder: true,
        canAddShop: true,
        canViewStock: true,
        canViewEod: true,
        offlineSyncEnabled: true
      },
      orders,
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin HQ Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Revenue today
    const dailyStats = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$netPayable' }, orders: { $sum: 1 } } }
    ]);
    
    // Collections today
    const dailyCollections = await Payment.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, collected: { $sum: '$amount' } } }
    ]);
    
    // Rep leaderboard (by order value)
    const repLeaderboard = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$salesman', totalSales: { $sum: '$netPayable' }, orderCount: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'repInfo' } },
      { $unwind: { path: '$repInfo', preserveNullAndEmptyArrays: true } },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      { $project: { username: '$repInfo.username', totalSales: 1, orderCount: 1 } }
    ]);
    
    // Top products today
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subTotal' } } },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo' } },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      { $project: { name: '$productInfo.name', totalQty: 1, totalRevenue: 1 } }
    ]);
    
    // Total users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Total retailers
    const totalRetailers = await Retailer.countDocuments();
    
    // 7-day trend
    const graphData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const [dayOrders, dayPayments] = await Promise.all([
        Order.aggregate([{ $match: { createdAt: { $gte: day, $lte: dayEnd }, status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$netPayable' } } }]),
        Payment.aggregate([{ $match: { createdAt: { $gte: day, $lte: dayEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
      ]);
      
      graphData.push({
        date: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        Sales: dayOrders[0]?.total || 0,
        Collection: dayPayments[0]?.total || 0
      });
    }
    
    // Outstanding totals
    const outstandingDebts = await Retailer.aggregate([
      { $group: { _id: null, total: { $sum: '$outstandingBalance' }, count: { $sum: { $cond: [{ $gt: ['$outstandingBalance', 0] }, 1, 0] } } } }
    ]);
    
    res.json({
      success: true,
      today: {
        revenue: dailyStats[0]?.revenue || 0,
        orders: dailyStats[0]?.orders || 0,
        collected: dailyCollections[0]?.collected || 0,
        outstandingDebts: outstandingDebts[0]?.total || 0,
        shopsWithDebt: outstandingDebts[0]?.count || 0
      },
      repLeaderboard,
      topProducts,
      usersByRole,
      totalRetailers,
      graphData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};