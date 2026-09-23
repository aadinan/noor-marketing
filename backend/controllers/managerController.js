const Order = require('../models/Order');
const User = require('../models/User');
const Retailer = require('../models/Retailer');

// @desc    Get all Salesmen performance (Total sales per rep)
// @route   GET /api/manager/salesmen-performance
// @access  Private (Admin & Manager)
exports.getSalesmenPerformance = async (req, res) => {
  try {
    const performance = await Order.aggregate([
      {
        $group: {
          _id: '$salesman',
          totalSales: { $sum: '$netPayable' },
          orderCount: { $sum: 1 },
          totalIncentivesGenerated: { $sum: '$staffIncentiveAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'salesmanInfo'
        }
      },
      { $unwind: '$salesmanInfo' },
      {
        $project: {
          _id: 1,
          totalSales: 1,
          orderCount: 1,
          totalIncentivesGenerated: 1,
          'salesmanInfo.username': 1
        }
      }
    ]);

    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Order Status (Manager approving/packing an order)
// @route   PUT /api/manager/orders/:id/status
// @access  Private (Admin, Manager, Warehouse)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g., 'Packed' or 'Out for Delivery'
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ success: true, message: `Order marked as ${status}`, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reassign a Retailer to a different Salesman
// @route   PUT /api/manager/retailers/:id/reassign
// @access  Private (Admin & Manager)
exports.reassignRetailer = async (req, res) => {
  try {
    const { newSalesmanId } = req.body;
    
    const retailer = await Retailer.findByIdAndUpdate(
      req.params.id,
      { assignedSalesman: newSalesmanId },
      { new: true }
    );

    res.json({ success: true, message: 'Retailer reassigned successfully', retailer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get High Debt Report (Retailers owing more than a specific limit)
// @route   GET /api/manager/debt-report
// @access  Private (Admin & Manager)
exports.getDebtReport = async (req, res) => {
  try {
    const limit = req.query.limit || 10000; // Default: show shops owing > 10,000

    const riskyRetailers = await Retailer.find({ 
      outstandingBalance: { $gt: limit } 
    })
    .sort({ outstandingBalance: -1 }) // Show highest debt first
    .select('shopName ownerName phoneNumber outstandingBalance address');

    res.json({
      success: true,
      count: riskyRetailers.length,
      thresholdUsed: limit,
      data: riskyRetailers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};