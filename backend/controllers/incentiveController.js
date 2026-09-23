const Incentive = require('../models/Incentive');
const User = require('../models/User');

exports.getMyIncentives = async (req, res) => {
  try {
    const incentives = await Incentive.find({ salesman: req.user._id })
      .populate('order', 'totalOrderValue netPayable createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: incentives });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllIncentives = async (req, res) => {
  try {
    const incentives = await Incentive.find()
      .populate('salesman', 'username role')
      .populate('order', 'totalOrderValue netPayable createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: incentives });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIncentiveSummary = async (req, res) => {
  try {
    const summary = await Incentive.aggregate([
      {
        $group: {
          _id: { salesman: '$salesman', status: '$paidStatus' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.salesman',
          stats: {
            $push: {
              status: '$_id.status',
              totalAmount: '$totalAmount',
              count: '$count'
            }
          }
        }
      }
    ]);
    
    await User.populate(summary, { path: '_id', select: 'username' });
    
    const formatted = summary.map(item => {
      let paid = 0, unpaid = 0;
      item.stats.forEach(s => {
        if (s.status === 'Paid') paid = s.totalAmount;
        if (s.status === 'Unpaid') unpaid = s.totalAmount;
      });
      return {
        salesman: item._id,
        paidAmount: paid,
        unpaidAmount: unpaid,
        totalAmount: paid + unpaid
      };
    });
    
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
