// backend/controllers/retailerController.js
const Retailer = require('../models/Retailer');

// @desc    Register a new Retailer (Shop)
// @route   POST /api/retailers
exports.createRetailer = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      phoneNumber,
      gstNumber,
      address,
      creditLimit,
      // Optionals
      incentiveStaffName,
      incentiveStaffPhone,
      incentivePercentage,
      incentiveTarget
    } = req.body;

    // 1. Basic Validation
    if (!shopName || !ownerName || !phoneNumber || !gstNumber || !address?.city) {
      return res.status(400).json({ message: "Missing required fields (Shop Name, Owner, Phone, GST, City)" });
    }

    // 2. Check for Duplicates
    const existingShop = await Retailer.findOne({
      $or: [{ phoneNumber }, { gstNumber }]
    });

    if (existingShop) {
      return res.status(400).json({ message: 'Shop with this Phone or GST already exists.' });
    }

    // 3. Create Retailer explicitly (Avoid spreading req.body to prevent pollution)
    const retailer = new Retailer({
      shopName,
      ownerName,
      phoneNumber,
      gstNumber,
      address, // Ensure this is an object: { line1, city }
      creditLimit: Number(creditLimit) || 10000,

      incentiveStaffName: incentiveStaffName || "",
      incentiveStaffPhone: incentiveStaffPhone || "",
      incentivePercentage: Number(incentivePercentage) || 0,
      incentiveTarget: Number(incentiveTarget) || 0,

      assignedSalesman: req.user ? req.user._id : null
    });

    // 4. Save
    await retailer.save();

    res.status(201).json({
      success: true,
      data: retailer
    });

  } catch (error) {
    console.error("CREATE RETAILER ERROR:", error);
    // Return the actual error message
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Quick Register Retailer (Minimal payload)
// @route   POST /api/retailers/quick-add
exports.createRetailerQuick = async (req, res) => {
  try {
    const { shopName, phoneNumber } = req.body;

    if (!shopName || !phoneNumber) {
      return res.status(400).json({ message: "Shop Name and Phone Number are required" });
    }

    const existingShop = await Retailer.findOne({ phoneNumber });
    if (existingShop) {
      return res.status(400).json({ message: 'Shop with this Phone already exists.' });
    }

    // Generate dummy GST using phone prefix, default city to Unassigned
    const dummyGst = `UNR${phoneNumber.substring(0, 4)}PENDING`;

    const retailer = new Retailer({
      shopName,
      ownerName: "Pending",
      phoneNumber,
      gstNumber: dummyGst,
      address: { city: "Unassigned" },
      creditLimit: 5000, // Small default for quick-add shops
      assignedSalesman: req.user ? req.user._id : null
    });

    await retailer.save();

    res.status(201).json({ success: true, data: retailer });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Get all retailers (Supports Search & Sort)
// @route   GET /api/retailers
exports.getRetailers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // If search term is provided, filter by Name, Owner, or City
    if (search) {
      query = {
        $or: [
          { shopName: { $regex: search, $options: 'i' } },
          { ownerName: { $regex: search, $options: 'i' } },
          { 'address.city': { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Fetch and Sort Alphabetically by Shop Name
    const retailers = await Retailer.find(query)
      .populate('assignedSalesman', 'username')
      .sort({ shopName: 1 });

    // Return standard response format
    res.json({
      success: true,
      count: retailers.length,
      data: retailers
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Retailer by ID (Useful for details page)
// @route   GET /api/retailers/:id
exports.getRetailerById = async (req, res) => {
  try {
    const retailer = await Retailer.findById(req.params.id);
    if (!retailer) return res.status(404).json({ message: "Retailer not found" });
    res.json(retailer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update Retailer Details
// @route   PUT /api/retailers/:id
exports.updateRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: false }
    );
    if (!retailer) return res.status(404).json({ message: 'Retailer not found' });
    res.json({ success: true, data: retailer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete Retailer
// @route   DELETE /api/retailers/:id
exports.deleteRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.findByIdAndDelete(req.params.id);
    if (!retailer) return res.status(404).json({ message: 'Retailer not found' });
    res.json({ success: true, message: 'Retailer removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Freeze/Unfreeze Credit for a Retailer
// @route   PUT /api/retailers/:id/freeze
exports.freezeCredit = async (req, res) => {
  try {
    const { freeze, reason } = req.body;
    const retailer = await Retailer.findByIdAndUpdate(
      req.params.id,
      { creditFrozen: freeze, freezeReason: reason || '' },
      { new: true, strict: false }
    );
    if (!retailer) return res.status(404).json({ message: 'Retailer not found' });
    res.json({ success: true, message: freeze ? 'Credit frozen' : 'Credit unfrozen', data: retailer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get Dormant Retailers (no order in 30+ days)
// @route   GET /api/retailers/dormant
exports.getDormantRetailers = async (req, res) => {
  // Shops with no order in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  try {
    const dormant = await Retailer.find({
      $or: [
        { lastOrderDate: { $lt: thirtyDaysAgo } },
        { lastOrderDate: null }
      ]
    }).sort({ lastOrderDate: 1 }).select('shopName ownerName phoneNumber outstandingBalance address lastOrderDate creditLimit');
    res.json({ success: true, count: dormant.length, data: dormant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};