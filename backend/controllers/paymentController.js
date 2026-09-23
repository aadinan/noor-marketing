const Payment = require('../models/Payment');
const Retailer = require('../models/Retailer');
const { recalculateCreditLimit } = require('../utils/creditEngine'); // Import your scientific engine

// @desc    Record a new payment
// @route   POST /api/payments
exports.recordPayment = async (req, res) => {
  const { retailerId, amount, method, transactionReference, chequeDate, bankName, location } = req.body;

  try {
    // 1. Create the Payment Record
    const payment = await Payment.create({
      retailer: retailerId,
      collectedBy: req.user._id, // Logged in Salesman
      amount,
      method,
      transactionReference,
      chequeDate,
      bankName,
      location
    });

    // 2. ATOMIC UPDATE: Reduce Retailer's Debt
    // We use $inc with a negative number to subtract safely
    const retailer = await Retailer.findByIdAndUpdate(
      retailerId,
      {
        $inc: { outstandingBalance: -amount },
        $set: { 'metrics.lastPaymentDate': Date.now() } // Update "Last Active"
      },
      { new: true } // Return the updated document
    );

    // 3. OPTIONAL: Trigger Scientific Credit Score Update?
    // Good idea to run this once a payment is made to see if they qualify for a higher limit.
    // await recalculateCreditLimit(retailer); 

    res.status(201).json({
      success: true,
      msg: `Payment of ₹${amount} recorded. New Balance: ₹${retailer.outstandingBalance}`,
      payment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Daily Collection Report for Salesman
// @route   GET /api/payments/eod-report
exports.getEODReport = async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    // MongoDB Aggregation Pipeline
    const report = await Payment.aggregate([
      {
        $match: {
          collectedBy: req.user._id, // Only this salesman's data
          createdAt: { $gte: todayStart, $lte: todayEnd } // Only Today
        }
      },
      {
        $group: {
          _id: "$method", // Group by CASH, CHEQUE, UPI
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          transactions: {
            $push: {  // List the details for checking
              shop: "$retailer", // Note: In real app, use $lookup to get Shop Name
              amount: "$amount",
              ref: "$transactionReference"
            }
          }
        }
      }
    ]);

    // Calculate Grand Total
    const grandTotal = report.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({
      date: new Date().toDateString(),
      salesman: req.user.username,
      summary: report,
      grandTotal
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments (Role based filter)
// @route   GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Salesman') {
      query.collectedBy = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('retailer', 'shopName')
      .populate('collectedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Payment Status (e.g. Cleared, Bounced)
// @route   PATCH /api/payments/:id/status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (status === 'BOUNCED' && payment.status !== 'BOUNCED') {
      await Retailer.findByIdAndUpdate(payment.retailer, {
        $inc: { outstandingBalance: payment.amount }
      });
    }

    payment.status = status;
    if (notes) payment.notes = notes;
    await payment.save();

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};