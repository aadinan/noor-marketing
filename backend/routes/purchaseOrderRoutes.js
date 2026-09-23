const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createPurchaseOrder, getPurchaseOrders, receivePurchaseOrder } = require('../controllers/purchaseOrderController');

router.use(protect);

router.post('/', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), createPurchaseOrder);
router.get('/', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), getPurchaseOrders);
router.put('/:id/receive', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), receivePurchaseOrder);

module.exports = router;
