const InventoryTransaction = require('../models/InventoryTransaction');
const Product = require('../models/Product');
const StockException = require('../models/StockException');
const { runInventoryAnalysis } = require('../utils/inventoryEngine');

// @desc    Get Transaction History for a single product
// @route   GET /api/inventory/history/:productId
// @access  Private
exports.getTransactionHistory = async (req, res) => {
    try {
        const history = await InventoryTransaction.find({ productId: req.params.productId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Trigger Scientific Inventory Analysis manually
// @route   POST /api/inventory/run-analysis
// @access  Private (Admin / Warehouse)
exports.triggerInventoryAnalysis = async (req, res) => {
    try {
        const alerts = await runInventoryAnalysis();
        res.json({ success: true, message: "Analysis complete", alerts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Low Stock Alerts mapped by the ABC analysis 
// @route   GET /api/inventory/alerts
// @access  Private
exports.getLowStockAlerts = async (req, res) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ["$inventory.stockCount", "$metrics.reorderPoint"] },
            "metrics.classification": { $ne: "Dead" }
        }).select('name sku inventory metrics');

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Report a stock count discrepancy
// @route   POST /api/inventory/exceptions
// @access  Private
exports.reportStockException = async (req, res) => {
    try {
        const { productId, actualCount, notes, photoProofUrl } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const systemCount = product.inventory.stockCount;
        const discrepancy = actualCount - systemCount;

        const exception = await StockException.create({
            product: productId,
            reportedBy: req.user.id,
            systemCount,
            actualCount,
            discrepancy,
            photoProofUrl,
            notes
        });

        res.status(201).json({ success: true, message: "Exception reported for Manager review.", data: exception });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
