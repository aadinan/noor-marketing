const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

// @desc    Create a new Purchase Order
// @route   POST /api/purchase-orders
// @access  Private (Manager/Boss/Warehouse)
exports.createPurchaseOrder = async (req, res) => {
    try {
        const { supplierId, items, expectedDelivery } = req.body;
        // Items sample: [{ product: id, orderedQty: 50 }]

        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) return res.status(404).json({ message: `Product ${item.product} not found.` });

            // Automatically use the product's basePrice for vendor cost
            const unitCost = product.basePrice;
            const totalCost = unitCost * item.orderedQty;
            totalAmount += totalCost;

            processedItems.push({
                product: product._id,
                orderedQty: item.orderedQty,
                unitCost,
                totalCost
            });
        }

        const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newPO = await PurchaseOrder.create({
            poNumber,
            supplier: supplierId,
            createdBy: req.user.id,
            items: processedItems,
            totalAmount,
            status: 'DRAFT',
            expectedDelivery
        });

        res.status(201).json({ success: true, message: "Purchase Order Draft Created", data: newPO });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all POs
// @route   GET /api/purchase-orders
exports.getPurchaseOrders = async (req, res) => {
    try {
        const pos = await PurchaseOrder.find()
            .populate('supplier', 'name email contactPerson')
            .sort({ createdAt: -1 });
        res.json(pos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.receivePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'PO not found' });
    if (po.status === 'RECEIVED') return res.status(400).json({ message: 'PO already received' });
    // Update each product stock
    for (const item of po.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.stockCount': item.orderedQty }
      });
    }
    po.status = 'RECEIVED';
    po.receivedDate = new Date();
    await po.save();
    // Create inventory transaction logs
    const InventoryTransaction = require('../models/InventoryTransaction');
    for (const item of po.items) {
      await InventoryTransaction.create({
        productId: item.product,
        user: req.user._id,
        type: 'Stock In',
        quantity: item.orderedQty,
        reason: `Received PO: ${po.poNumber}`
      });
    }
    res.json({ success: true, message: 'Purchase Order received and stock updated', data: po });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
