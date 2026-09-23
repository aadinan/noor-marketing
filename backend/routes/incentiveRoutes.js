const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/incentiveController');

router.use(protect);

router.get('/me', ctrl.getMyIncentives);
router.get('/all', authorize('Manager', 'Boss', 'Admin'), ctrl.getAllIncentives);
router.get('/summary', authorize('Manager', 'Boss', 'Admin'), ctrl.getIncentiveSummary);

module.exports = router;
