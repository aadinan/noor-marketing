const express = require('express');
const router = express.Router();

const { 
  getSalesmenPerformance, 
  updateOrderStatus, 
  reassignRetailer,
  getDebtReport // <--- ADD THIS
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All manager routes require high-level authorization
router.get('/performance', protect, authorize('Admin', 'Manager'), getSalesmenPerformance);
router.put('/order-status/:id', protect, authorize('Admin', 'Manager', 'Warehouse'), updateOrderStatus);
router.put('/reassign-retailer/:id', protect, authorize('Admin', 'Manager'), reassignRetailer);
router.get('/debt-report', protect, authorize('Admin', 'Manager'), getDebtReport); 

module.exports = router;