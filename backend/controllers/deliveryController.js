const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Retailer = require('../models/Retailer');

exports.getDeliveryList = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      salesman: req.user._id,
      status: { $in: ['PENDING', 'OUT_FOR_DELIVERY'] }
    })
      .populate('order')
      .populate('retailer', 'shopName ownerName phoneNumber address');
    res.json({ success: true, data: deliveries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markDelivered = async (req, res) => {
  try {
    const { paymentCollected, paymentMode, driverNotes, proofDescription } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    
    delivery.status = 'DELIVERED';
    delivery.deliveredAt = new Date();
    delivery.paymentCollected = paymentCollected || 0;
    delivery.paymentMode = paymentMode || 'Credit';
    delivery.driverNotes = driverNotes;
    delivery.proofDescription = proofDescription;
    
    await delivery.save();
    
    const order = await Order.findById(delivery.order);
    if (order) {
      order.status = 'Delivered';
      await order.save();
    }
    
    if (delivery.paymentCollected > 0) {
      await Retailer.findByIdAndUpdate(delivery.retailer, {
        $inc: { outstandingBalance: -delivery.paymentCollected }
      });
      
      // Could also create a Payment record here if the system has it.
      const Payment = require('../models/Payment');
      if (Payment) {
        await Payment.create({
          retailer: delivery.retailer,
          collectedBy: req.user._id,
          amount: delivery.paymentCollected,
          mode: delivery.paymentMode,
          referenceNotes: `Delivery ${delivery._id}`
        });
      }
    }
    
    res.json({ success: true, message: 'Delivery marked as completed', data: delivery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeliveryHistory = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      salesman: req.user._id,
      status: 'DELIVERED'
    })
      .populate('order')
      .populate('retailer', 'shopName ownerName phoneNumber address')
      .sort({ deliveredAt: -1 });
    res.json({ success: true, data: deliveries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('order')
      .populate('retailer', 'shopName ownerName phoneNumber address')
      .populate('salesman', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: deliveries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
