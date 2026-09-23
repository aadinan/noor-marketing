const Estimate = require('../models/Estimate');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Retailer = require('../models/Retailer');

exports.createEstimate = async (req, res) => {
  try {
    const { retailerId, customerInfo, items, discountPercent, notes } = req.body;
    
    // Auto-generate estimateNumber
    const year = new Date().getFullYear();
    const count = await Estimate.countDocuments() + 1;
    const estimateNumber = `EST-${year}-${count.toString().padStart(4, '0')}`;
    
    let totalAmount = 0;
    const estimateItems = [];
    
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) return res.status(400).json({ message: `Product ${item.product} not found` });
      
      const price = product.mrp;
      const subTotal = price * item.quantity;
      totalAmount += subTotal;
      
      estimateItems.push({
        product: product._id,
        quantity: item.quantity,
        price,
        subTotal
      });
    }
    
    const dPercent = discountPercent || 0;
    const discountAmount = (totalAmount * dPercent) / 100;
    const finalAmount = totalAmount - discountAmount;
    
    const status = dPercent > 10 ? 'PENDING_APPROVAL' : 'APPROVED';
    
    const estimate = await Estimate.create({
      estimateNumber,
      retailer: retailerId || null,
      customerInfo: customerInfo || undefined,
      salesman: req.user._id,
      items: estimateItems,
      totalAmount,
      discountPercent: dPercent,
      discountAmount,
      finalAmount,
      status,
      notes
    });
    
    res.status(201).json({ success: true, data: estimate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEstimates = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Salesman') {
      query.salesman = req.user._id;
    }
    
    const estimates = await Estimate.find(query)
      .populate('retailer', 'shopName')
      .populate('salesman', 'username')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: estimates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEstimateById = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id)
      .populate('retailer', 'shopName ownerName phoneNumber address')
      .populate('salesman', 'username')
      .populate('items.product', 'name sku brand basePrice mrp')
      .populate('convertedSalesOrderId');
      
    if (!estimate) return res.status(404).json({ message: 'Estimate not found' });
    res.json({ success: true, data: estimate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ message: 'Estimate not found' });
    
    estimate.status = 'APPROVED';
    await estimate.save();
    
    res.json({ success: true, message: 'Estimate approved', data: estimate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ message: 'Estimate not found' });
    
    estimate.status = 'REJECTED';
    await estimate.save();
    
    res.json({ success: true, message: 'Estimate rejected', data: estimate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.convertEstimateToOrder = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ message: 'Estimate not found' });
    if (estimate.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Only APPROVED estimates can be converted' });
    }
    
    if (!estimate.retailer) {
       return res.status(400).json({ message: 'Retailer is required to convert to order' });
    }
    
    const productIds = estimate.items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    const productsToUpdate = [];
    const orderItems = [];
    
    for (const item of estimate.items) {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (!product) return res.status(400).json({ message: `Product ${item.product} not found` });
      
      if (product.inventory.stockCount < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      product.inventory.stockCount -= item.quantity;
      productsToUpdate.push(product);
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        wholesalePriceAtTime: item.price,
        subTotal: item.subTotal,
        locationSnap: product.inventory.physicalPath || 'Unassigned'
      });
    }
    
    await Promise.all(productsToUpdate.map(p => p.save()));
    
    const retailer = await Retailer.findById(estimate.retailer);
    
    const order = await Order.create({
      salesman: estimate.salesman,
      retailer: estimate.retailer,
      items: orderItems,
      totalOrderValue: estimate.totalAmount,
      discountApplied: estimate.discountAmount,
      netPayable: estimate.finalAmount,
      staffIncentiveAmount: estimate.finalAmount * (retailer.incentivePercentage / 100 || 0),
      status: 'Processing'
    });
    
    await Retailer.findByIdAndUpdate(estimate.retailer, {
      $inc: { outstandingBalance: estimate.finalAmount },
      lastOrderDate: new Date()
    });
    
    estimate.status = 'CONVERTED';
    estimate.convertedSalesOrderId = order._id;
    await estimate.save();
    
    res.json({ success: true, message: 'Estimate converted to order successfully', order, estimate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
