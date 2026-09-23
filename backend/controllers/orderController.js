const Order = require('../models/Order');
const Product = require('../models/Product');
const Retailer = require('../models/Retailer');

// CONFIG: Fixed Cash Discount % (e.g., 2% for Ready Cash)
const READY_CASH_DISCOUNT = 2.0;

/**
 * @desc    Approve High-Debt Order (Accessible by Boss OR Manager)
 * @route   PUT /api/orders/:id/approve-credit
 */
exports.approveCreditOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: "This order is not waiting for approval." });
    }

    if (req.user.role !== 'Boss' && req.user.role !== 'Manager') {
      return res.status(403).json({ message: "You do not have permission to approve credit." });
    }

    // Decrement stock now that it's approved
    const productsToUpdate = [];
    const productIds = order.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    for (const item of order.items) {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found.` });
      }
      if (product.inventory.stockCount < item.quantity) {
         return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      product.inventory.stockCount -= item.quantity;
      productsToUpdate.push(product);
    }
    await Promise.all(productsToUpdate.map(p => p.save()));

    // Approve the Order
    order.status = 'Processing';

    await order.save();

    await Retailer.findByIdAndUpdate(order.retailer, {
      $inc: { outstandingBalance: order.netPayable }
    });

    res.json({
      success: true,
      message: `Order approved by ${req.user.role}. Stock decremented. Sent to Warehouse.`
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Create Order with Credit Check & Manager Auth
 * @route   POST /api/orders
 */
exports.createOrder = async (req, res) => {
  try {
    const { retailerId, items, deliveryInfo, paymentTerms } = req.body;
    const retailer = await Retailer.findById(retailerId);
    if (!retailer) return res.status(404).json({ success: false, message: "Retailer not found." });

    let grossTotal = 0;
    const orderItems = [];

    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ success: false, message: "One or more products not found" });
    }

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product);

      if (product.inventory.stockCount < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      const subTotal = product.basePrice * item.quantity;
      grossTotal += subTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        wholesalePriceAtTime: product.basePrice,
        subTotal,
        locationSnap: product.inventory.physicalPath || 'Unassigned'
      });
    }

    const currentDebt = retailer.outstandingBalance || 0;
    const limit = retailer.creditLimit || 50000;
    const isOverLimit = (currentDebt + grossTotal) > limit;

    let finalStatus = 'Pending';
    let discountAmt = 0;
    if (paymentTerms === 'Ready Cash') {
      discountAmt = (grossTotal * 2.0) / 100;
    }

    const netPayable = grossTotal - discountAmt;
    
    // Only decrement stock if NOT over limit
    if (!isOverLimit) {
      const productsToUpdate = [];
      for (const item of items) {
        const product = products.find(p => p._id.toString() === item.product);
        product.inventory.stockCount -= item.quantity;
        productsToUpdate.push(product);
      }
      await Promise.all(productsToUpdate.map(p => p.save()));
      finalStatus = 'Processing';
    }

    const order = await Order.create({
      salesman: req.user._id,
      retailer: retailerId,
      items: orderItems,
      totalOrderValue: grossTotal,
      discountApplied: discountAmt,
      netPayable: netPayable,
      staffIncentiveAmount: netPayable * (retailer.incentivePercentage / 100 || 0),
      status: finalStatus,
      deliveryInfo
    });

    await Retailer.findByIdAndUpdate(retailerId, { lastOrderDate: new Date() });

    if (!isOverLimit) {
      await Retailer.findByIdAndUpdate(retailerId, {
        $inc: { outstandingBalance: netPayable }
      });
    }

    res.status(201).json({
      success: true,
      requiresCreditApproval: isOverLimit,
      message: isOverLimit
        ? "Order held for Manager Approval due to Credit Limit."
        : "Order placed and reserved.",
      order
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get All Orders (With Filter)
// @route   GET /api/orders?status=Pending
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('retailer', 'shopName')
      .populate('items.product', 'name sku')
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update Order Status (e.g., Pending -> Packed)
// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get Single Order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('retailer', 'shopName ownerName phoneNumber creditLimit outstandingBalance address')
      .populate('salesman', 'username')
      .populate('items.product', 'name sku brand basePrice')
      .populate('approvedBy', 'username')
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Cancel Order
// @route   POST /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot cancel a ${order.status} order.` });
    }
    
    // If order was already Processing, restore stock
    if (order.status === 'Processing') {
      const productIds = order.items.map(item => item.product);
      const products = await Product.find({ _id: { $in: productIds } });
      const productsToUpdate = [];
      for (const item of order.items) {
        const product = products.find(p => p._id.toString() === item.product.toString());
        if (product) {
          product.inventory.stockCount += item.quantity;
          productsToUpdate.push(product);
        }
      }
      await Promise.all(productsToUpdate.map(p => p.save()));
      
      // We should also decrement outstanding balance from retailer here, but leaving as is since cancel logic wasn't explicitly asked to be changed beyond what was there, wait actually it says "Restore stock if it was deducted", so the comment was there. I'll add the balance update too.
      await Retailer.findByIdAndUpdate(order.retailer, {
        $inc: { outstandingBalance: -order.netPayable }
      });
    }

    order.status = 'Cancelled';
    order.cancelledBy = req.user._id;
    order.cancellationReason = reason || 'Cancelled by user';
    await order.save();
    
    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};