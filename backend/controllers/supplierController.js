const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction'); // Reusing your audit log

// 1. Create a Purchase Order (Draft)
exports.createPO = async (req, res) => {
  try {
    const { supplierId, items } = req.body;

    // Auto-Generate PO Number
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let totalAmount = 0;
    const processedItems = items.map(item => {
      const total = item.qty * item.cost;
      totalAmount += total;
      return {
        product: item.productId,
        orderedQty: item.qty,
        unitCost: item.cost,
        totalCost: total
      };
    });

    const po = await PurchaseOrder.create({
      poNumber,
      supplier: supplierId,
      createdBy: req.user._id,
      items: processedItems,
      totalAmount
    });

    res.status(201).json({ success: true, po });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. STOCK INWARD (The "Receive" Button)
// This updates inventory AND recalculates margins
exports.receiveStock = async (req, res) => {
  const { poId, receivedItems } = req.body;
  // receivedItems = [{ productId, qty, newCost, newSellingPrice }]

  try {
    const po = await PurchaseOrder.findById(poId);
    if (!po) return res.status(404).json({ message: "PO Not Found" });

    for (let item of receivedItems) {
      const product = await Product.findById(item.productId);

      // A. Update Stock
      product.inventory.stockCount += Number(item.qty);

      // B. Price & Margin Management
      // If the supplier changed the price, update your Cost Price
      if (item.newCost) product.basePrice = item.newCost;

      // If you want to change Selling Price to maintain margin
      if (item.newSellingPrice) product.mrp = item.newSellingPrice;

      // C. Calculate Margin for Analytics (Selling Price - Cost) / Selling Price
      const margin = ((product.mrp - product.basePrice) / product.mrp) * 100;
      // You could save this margin to a 'metrics' field if you want to track profitability

      await product.save();

      // D. Audit Log (Traceability)
      await InventoryTransaction.create({
        productId: product._id,
        user: req.user._id,
        type: 'INWARD',
        quantity: item.qty,
        reason: `PO Received: ${po.poNumber}`,
        referenceId: po._id
      });
    }

    po.status = 'COMPLETED';
    po.receivedDate = Date.now();
    await po.save();

    res.json({ success: true, message: "Stock Inward Successful. Prices Updated." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, supplier });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate('supplier', 'name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('supplier', 'name contactPerson email phone')
      .populate('items.product', 'name sku productCode');
    if (!po) return res.status(404).json({ message: 'PO not found' });
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePOStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, po });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};