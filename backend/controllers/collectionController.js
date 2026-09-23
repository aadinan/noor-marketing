const Collection = require('../models/Collection');
const Retailer = require('../models/Retailer');
const AuditLog = require('../models/AuditLog');

// Configuration: How much can a Salesman discount without asking the Boss?
const MAX_AUTO_DISCOUNT = 50;

exports.createCollection = async (req, res) => {
  try {
    const {
      clientType,
      clientId,
      amount,
      mode,
      refNum,
      discount,
      note,
      isOffline
    } = req.body;

    // 1. DISCOUNT VALIDATION (Flowchart: CheckLimit)
    let discStatus = 'None';
    let approvedDiscountValue = 0;

    if (discount > 0) {
      if (discount <= MAX_AUTO_DISCOUNT) {
        discStatus = 'Auto-Approved';
        approvedDiscountValue = discount;
      } else {
        discStatus = 'Pending_Approval';
        approvedDiscountValue = 0; // Boss must approve before this is deducted from ledger
      }
    }

    // 2. RECORD THE TRANSACTION
    const collection = await Collection.create({
      salesman: req.user.id,
      clientType,
      retailer: clientType === 'Shop' ? clientId : null,
      amountCollected: amount,
      paymentMode: mode,
      referenceNumber: refNum,
      note,
      discountAsked: discount,
      discountStatus: discStatus,
      isOfflineEntry: isOffline || false
    });

    // 3. LEDGER UPDATE (Flowchart: Update Shop Ledger)
    // We deduct: Collected Amount + Any Auto-Approved Discount
    if (clientType === 'Shop') {
      const reduction = amount + approvedDiscountValue;

      // Trust Score dynamic recalculation logic
      const retailerDoc = await Retailer.findById(clientId);
      let newTrustScore = 100;
      if (retailerDoc) {
        const debtRatio = ((retailerDoc.outstandingBalance - reduction) / (retailerDoc.creditLimit || 10000));
        if (debtRatio <= 0.2) newTrustScore = 95;
        else if (debtRatio <= 0.5) newTrustScore = 80;
        else if (debtRatio <= 0.8) newTrustScore = 60;
        else newTrustScore = 40;

        if (!retailerDoc.metrics) retailerDoc.metrics = {};
        // Assuming we can save an impromptu trust variable if schema allows, actually let's just save to mongoose and it might skip unknown fields unless strict: false
        // Or we update lastReviewDate
        retailerDoc.metrics.lastReviewDate = new Date();
      }

      const updatedRetailer = await Retailer.findByIdAndUpdate(
        clientId,
        {
          $inc: { outstandingBalance: -reduction },
          $set: { 'metrics.lastReviewDate': new Date(), 'metrics.trustScore': newTrustScore }
        },
        { new: true, strict: false } // Returns the updated document, strict: false handles missing schema fields dynamically if needed
      );

      return res.status(201).json({
        success: true,
        message: discStatus === 'Pending_Approval'
          ? "Payment saved. High discount sent to Manager for approval."
          : "Payment recorded and ledger updated.",
        data: collection,
        currentBalance: updatedRetailer.outstandingBalance
      });
    }

    res.status(201).json({ success: true, data: collection });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc Get History for specific user or all for Admin
exports.getCollections = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin' && req.user.role !== 'Boss' && req.user.role !== 'Manager') {
      query = { salesman: req.user.id };
    }

    const logs = await Collection.find(query)
      .populate('retailer', 'shopName')
      .populate('salesman', 'username')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- ADD THIS TO THE BOTTOM OF collectionController.js ---

/**
 * @desc    Manager/Boss: Approve a pending spot discount
 * @route   PUT /api/collections/:id/approve-discount
 */
exports.approveDiscount = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Collection record not found." });
    }

    if (collection.discountStatus !== 'Pending_Approval') {
      return res.status(400).json({ message: "This discount is not pending approval." });
    }

    // 1. Update Collection Status
    collection.discountStatus = 'Manager_Approved';
    await collection.save();

    // 2. ATOMIC LEDGER UPDATE: 
    // Now that it's approved, we deduct the discount amount from the shop's balance
    if (collection.retailer) {
      await Retailer.findByIdAndUpdate(collection.retailer, {
        $inc: { outstandingBalance: -collection.discountAsked }
      });
    }

    // 3. SPOT DISCOUNT AUDIT LOG
    await AuditLog.create({
      action: 'APPROVED_SPOT_DISCOUNT_COLLECTION',
      performedBy: req.user.id,
      targetId: collection._id.toString(),
      details: { amount: collection.discountAsked, retailerId: collection.retailer },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: "Discount approved. Retailer ledger has been updated."
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    End-Of-Day Report: Group today's collections by payment mode
// @route   GET /api/collections/eod-report
// @access  Private (Any logged-in role)
exports.getEodReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter by salesman unless Boss/Admin/Manager (who sees all)
    const matchQuery = { createdAt: { $gte: today } };
    if (req.user.role === 'Salesman') {
      matchQuery.salesman = req.user._id;
    }

    const collections = await Collection.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'retailers',
          localField: 'retailer',
          foreignField: '_id',
          as: 'retailerInfo'
        }
      },
      {
        $group: {
          _id: '$paymentMode',
          totalAmount: { $sum: '$amountCollected' },
          transactions: {
            $push: {
              amount: '$amountCollected',
              shopName: { $arrayElemAt: ['$retailerInfo.shopName', 0] },
              mode: '$paymentMode',
              refNum: '$referenceNumber',
              time: '$createdAt'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const grandTotal = collections.reduce((sum, g) => sum + g.totalAmount, 0);

    // Calculate explicit surface groupings
    const totalCash = collections.find(c => c._id === 'Cash')?.totalAmount || 0;
    const totalCheque = collections.find(c => c._id === 'Cheque')?.totalAmount || 0;
    const totalOnline = collections.filter(c => ['UPI', 'Bank Transfer', 'NEFT'].includes(c._id)).reduce((s, g) => s + g.totalAmount, 0);

    res.json({
      success: true,
      date: today.toDateString(),
      summary: collections,
      totalCash,
      totalOnline,
      totalCheque,
      grandTotal
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get Today's Collections (fast endpoint for Dashboard)
// @route   GET /api/collections/today
exports.getTodaysCollections = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const matchQuery = { createdAt: { $gte: today } };
    if (req.user.role === 'salesman' || req.user.role === 'Salesman') {
      matchQuery.salesman = req.user._id;
    }
    
    const collections = await Collection.find(matchQuery)
      .populate('retailer', 'shopName ownerName')
      .populate('salesman', 'username')
      .sort({ createdAt: -1 });
    
    const grandTotal = collections.reduce((sum, c) => sum + (c.amountCollected || 0), 0);
    
    res.json({ success: true, count: collections.length, grandTotal, data: collections });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};