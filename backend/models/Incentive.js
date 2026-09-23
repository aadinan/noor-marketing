const mongoose = require('mongoose');
const IncentiveSchema = new mongoose.Schema({
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  percentage: { type: Number },
  type: { type: String, enum: ['Order Commission', 'Monthly Target', 'Bonus'], default: 'Order Commission' },
  paidStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  month: { type: Number },
  year: { type: Number },
  notes: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Incentive', IncentiveSchema);
