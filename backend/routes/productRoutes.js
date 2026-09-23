const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  updateProduct,
  updateStock,
  getReorderReport
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Get all products (Searchable) - Open to all logged-in staff
router.get('/', protect, getProducts);

// 2. Scientific Reorder Report for Manager Dashboard
// NOTE: Must come BEFORE /:id routes to avoid being swallowed as a param
router.get('/reorder-report', protect, authorize('Manager', 'Boss', 'Admin'), getReorderReport);

// 3. Add a new product - Warehouse, Manager, and Boss
router.post('/', protect, authorize('Warehouse', 'Manager', 'Boss', 'Admin'), createProduct);

// 3.b Quick Add Minimal Product
router.post('/quick-add', protect, authorize('Warehouse', 'Manager', 'Boss', 'Admin'), require('../controllers/productController').createProductQuick);

// 4. Update full product details - Admin and Warehouse only
router.put('/:id', protect, authorize('Admin', 'Warehouse', 'Manager'), updateProduct);

// 5. Update stock count + log inventory transaction
router.patch('/:id/stock', protect, authorize('Admin', 'Warehouse', 'Manager'), updateStock);

module.exports = router;