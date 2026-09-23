const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const { 
  createOrder, 
  approveCreditOrder,
  getOrders, 
  updateOrderStatus, 
  getOrderById, 
  cancelOrder 
} = require('../controllers/orderController');

router.use(protect); // All routes require login

router.post('/', createOrder);
router.put('/:id/approve-credit', authorize('Manager', 'Boss'), approveCreditOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/cancel', authorize('Manager', 'Boss', 'Admin'), cancelOrder);

module.exports = router;