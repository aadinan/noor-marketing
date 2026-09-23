const express = require('express');
const router = express.Router();
const { getBossAnalytics, getReorderReport } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/boss', protect, authorize('Boss', 'Admin'), getBossAnalytics);
router.get('/reorder', protect, authorize('Manager', 'Boss', 'Admin'), getReorderReport);

module.exports = router;
