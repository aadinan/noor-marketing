const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getManagerDashboard,
    getWarehouseDashboard,
    getSalesmanDashboard,
    getAdminDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/boss', protect, authorize('Boss', 'Admin'), getDashboardStats);
router.get('/admin', protect, authorize('Admin'), getAdminDashboard);
router.get('/manager', protect, authorize('Manager', 'Admin', 'Boss'), getManagerDashboard);
router.get('/warehouse', protect, authorize('Warehouse', 'Admin', 'Boss'), getWarehouseDashboard);
router.get('/salesman', protect, authorize('Salesman'), getSalesmanDashboard);

module.exports = router;