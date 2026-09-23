const ProjectOrder = require('../models/ProjectOrder');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order'); // might need it if required
const Product = require('../models/Product');
const crypto = require('crypto');

exports.createProjectQuotation = async (req, res) => {
  try {
    const { projectName, clientName, clientType, siteAddress, estimatedValue, retailer, items, discountPercent, requiresSiteDelivery, staggeredDelivery, milestones, notes } = req.body;
    
    let totalAmount = 0;
    const projectItems = [];
    
    for (const item of items) {
      const subTotal = item.price * item.quantity;
      totalAmount += subTotal;
      projectItems.push({
        productName: item.productName,
        product: item.product || undefined,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        subTotal
      });
    }
    
    const dPercent = discountPercent || 0;
    const discountAmount = (totalAmount * dPercent) / 100;
    const finalAmount = totalAmount - discountAmount;
    
    const status = (estimatedValue > 100000 || dPercent > 10) ? 'PENDING_REVIEW' : 'APPROVED';
    const siteToken = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    const project = await ProjectOrder.create({
      projectName,
      clientName,
      clientType,
      siteAddress,
      estimatedValue,
      salesman: req.user._id,
      retailer,
      items: projectItems,
      discountPercent: dPercent,
      totalAmount: finalAmount,
      requiresSiteDelivery,
      staggeredDelivery,
      milestones,
      quotationStatus: status,
      siteToken,
      notes
    });
    
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjectOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Salesman') {
      query.salesman = req.user._id;
    }
    const projects = await ProjectOrder.find(query)
      .populate('salesman', 'username')
      .populate('retailer', 'shopName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjectOrderById = async (req, res) => {
  try {
    const project = await ProjectOrder.findById(req.params.id)
      .populate('salesman', 'username')
      .populate('retailer', 'shopName ownerName phoneNumber address')
      .populate('items.product', 'name sku brand')
      .populate('approvedBy', 'username')
      .populate('rejectedBy', 'username');
    if (!project) return res.status(404).json({ message: 'Project Order not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveProjectOrder = async (req, res) => {
  try {
    const project = await ProjectOrder.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project Order not found' });
    
    project.quotationStatus = 'APPROVED';
    project.approvedBy = req.user._id;
    await project.save();
    
    res.json({ success: true, message: 'Project Order approved', data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectProjectOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const project = await ProjectOrder.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project Order not found' });
    
    project.quotationStatus = 'REJECTED';
    project.rejectedBy = req.user._id;
    project.rejectionReason = reason;
    await project.save();
    
    res.json({ success: true, message: 'Project Order rejected', data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.convertProjectToActiveOrder = async (req, res) => {
  try {
    const project = await ProjectOrder.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project Order not found' });
    if (project.quotationStatus !== 'APPROVED') {
      return res.status(400).json({ message: 'Only APPROVED quotations can be converted to active orders' });
    }
    
    project.orderStatus = 'ACTIVE';
    await project.save();
    
    // Create warehouse delivery queue entries if needed. Since we have a Delivery model, maybe create an Order first?
    // The instruction says "create warehouse delivery queue entries". We can create a dummy Order or just wait, we created Delivery model with `order` ref.
    // I will create an Order then a Delivery.
    
    if (project.retailer) {
      const orderItems = project.items.filter(i => i.product).map(i => ({
        product: i.product,
        quantity: i.quantity,
        wholesalePriceAtTime: i.price,
        subTotal: i.subTotal,
        locationSnap: 'Project Site'
      }));
      
      if (orderItems.length > 0) {
        const order = await Order.create({
          salesman: project.salesman,
          retailer: project.retailer,
          items: orderItems,
          totalOrderValue: project.totalAmount,
          discountApplied: 0,
          netPayable: project.totalAmount,
          staffIncentiveAmount: 0,
          status: 'Processing'
        });
        
        await Delivery.create({
          order: order._id,
          salesman: project.salesman,
          retailer: project.retailer,
          status: 'PENDING'
        });
      }
    }
    
    res.json({ success: true, message: 'Project converted to active order', data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
