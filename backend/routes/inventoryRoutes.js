const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getTransactionHistory,
    triggerInventoryAnalysis,
    getLowStockAlerts,
    reportStockException
} = require('../controllers/inventoryController');

router.use(protect);

router.get('/history/:productId', getTransactionHistory);
router.get('/alerts', getLowStockAlerts);
router.post('/run-analysis', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), triggerInventoryAnalysis);
router.post('/exceptions', authorize('Warehouse', 'Manager', 'Admin', 'Boss'), reportStockException);

module.exports = router;
