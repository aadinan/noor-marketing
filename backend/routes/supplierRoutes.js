const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createSupplier,
    getSuppliers,
    getSupplierById,
    createPO,
    getPurchaseOrders,
    getPOById,
    updatePOStatus,
    receiveStock
} = require('../controllers/supplierController');

router.use(protect);

router.post('/', authorize('Admin', 'Boss', 'Manager'), createSupplier);
router.get('/', getSuppliers);
router.get('/:id', getSupplierById);

router.post('/purchase-orders', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), createPO);
router.get('/purchase-orders', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), getPurchaseOrders);
router.get('/purchase-orders/:id', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), getPOById);
router.put('/purchase-orders/:id/status', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), updatePOStatus);
router.post('/purchase-orders/receive', authorize('Admin', 'Boss', 'Manager', 'Warehouse'), receiveStock);

module.exports = router;
