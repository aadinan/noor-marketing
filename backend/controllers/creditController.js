const Retailer = require('../models/Retailer');
const CreditRequest = require('../models/CreditRequest');

exports.requestLimitIncrease = async (req, res) => {
  try {
    const { retailerId, requestedAmount, reason } = req.body;

    const retailer = await Retailer.findById(retailerId);
    if (!retailer) return res.status(404).json({ msg: "Retailer not found" });

    const request = await CreditRequest.create({
      retailer: retailerId,
      requestedBy: req.user._id,
      currentLimit: retailer.creditLimit,
      requestedAmount,
      reason
    });

    // TODO: Send notification to Admin (Socket.io or Email)
    res.status(201).json({ msg: "Request sent to Admin", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveCreditRequest = async (req, res) => {
  try {
    const { requestId, adminComment } = req.body;

    const request = await CreditRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    // 1. Update the Request Status
    request.status = 'APPROVED';
    request.adminComment = adminComment;
    request.reviewedBy = req.user._id;
    request.reviewedAt = Date.now();
    await request.save();

    // 2. IMPORTANT: Update the Retailer and set it to Manual Override
    const retailer = await Retailer.findById(request.retailer);
    retailer.creditLimit = request.requestedAmount;

    // Ensure metrics object exists
    if (!retailer.metrics) retailer.metrics = {};

    retailer.metrics.isManualLimit = true; // Switch to Manual so Auto-Engine doesn't revert it
    retailer.metrics.manualLimitValue = request.requestedAmount;

    await retailer.save();

    res.json({ msg: "Credit limit updated successfully", newLimit: retailer.creditLimit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingCreditRequests = async (req, res) => {
  try {
    const requests = await CreditRequest.find({ status: 'PENDING' })
      .populate('retailer', 'shopName currentLimit outstandingBalance')
      .populate('requestedBy', 'username');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectCreditRequest = async (req, res) => {
  try {
    const { requestId, adminComment } = req.body;

    const request = await CreditRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    request.status = 'REJECTED';
    request.adminComment = adminComment;
    request.reviewedBy = req.user._id;
    request.reviewedAt = Date.now();
    await request.save();

    res.json({ msg: "Credit request rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};