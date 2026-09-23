const Product = require('../models/Product');

// @desc    Add a new product to inventory
// @route   POST /api/products
// @access  Private (Admin Only)
exports.createProduct = async (req, res) => {
  try {
    // We don't need manual validation here because 
    // Mongoose schema will enforce types (Number, String, etc.)
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    // This catches duplicate SKU errors or missing required fields
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Quick Add Product (Minimal payload)
// @route   POST /api/products/quick-add
// @access  Private (Admin, Warehouse, Manager, Boss)
exports.createProductQuick = async (req, res) => {
  try {
    const { name, sku, brand, price, category } = req.body;
    if (!name || !sku) return res.status(400).json({ success: false, message: "Name and SKU are required." });

    const newProduct = await Product.create({
      name,
      sku: sku.toUpperCase(),
      brand: brand || "General",
      category: category || "General",
      productCode: sku.toUpperCase(),
      basePrice: Number(price) || 0,
      mrp: Number(price) || 0,
      inventory: { 
        stockCount: 0,
        location: { zone: 'A', rack: 'General', shelf: 'Floor' }
      }
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all products (with Search & Filter)
// @route   GET /api/products?keyword=wipro
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    // 1. Build Search Logic
    const keyword = req.query.keyword ? {
      $or: [
        { name: { $regex: req.query.keyword, $options: 'i' } }, // Case insensitive search by Name
        { brand: { $regex: req.query.keyword, $options: 'i' } }, // Search by Brand
        { sku: { $regex: req.query.keyword, $options: 'i' } },   // Search by SKU
        { productCode: { $regex: req.query.keyword, $options: 'i' } } // Search by Catalog No
      ]
    } : {};

    // 2. Pagination Logic
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // 3. Fetch from DB
    const products = await Product.find({ ...keyword }).limit(limit).skip(skip);
    const total = await Product.countDocuments({ ...keyword });

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update product stock or details
// @route   PUT /api/products/:id
// @access  Private (Admin or Warehouse)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Update stock and record movement
// @route   PATCH /api/products/:id/stock
exports.updateStock = async (req, res) => {
  const { quantity, type, reason, newLocation } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product Not Found" });

    const oldStock = product.inventory.stockCount;
    const oldPath = product.inventory.physicalPath;

    // 1. Update Product Data
    product.inventory.stockCount += Number(quantity);

    // 2. If location is changing, update it
    if (newLocation) {
      product.inventory.location = { ...product.inventory.location, ...newLocation };
    }

    await product.save(); // Middleware handles the physicalPath and status auto-updates

    // 3. Create History Log
    await InventoryTransaction.create({
      productId: product._id,
      user: req.user._id,
      type,
      quantity,
      fromLocation: oldPath,
      toLocation: product.inventory.physicalPath,
      reason
    });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Scientific Reorder List
// @route   GET /api/products/reorder-report
exports.getReorderReport = async (req, res) => {
  try {
    // 1. Find all products where Stock <= ReorderPoint
    // 2. Sort by Classification (A first, then B) so we buy Fast items first
    const reorderList = await Product.find({
      $expr: { $lte: ["$inventory.stockCount", "$metrics.reorderPoint"] },
      "metrics.classification": { $ne: "Dead" } // Ignore dead stock
    }).sort({ "metrics.classification": 1 }); // Sort A -> B -> C

    // Format for Frontend Table
    const report = reorderList.map(p => ({
      sku: p.sku,
      name: p.name,
      stock: p.inventory.stockCount,
      reorderPoint: p.metrics.reorderPoint,
      dailyUsage: p.metrics.averageDailySales,
      type: p.metrics.classification, // 'A' (High Priority) or 'B'
      suggestedOrder: Math.ceil(p.metrics.reorderPoint * 2) - p.inventory.stockCount // Suggest buying enough for 2 cycles
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};