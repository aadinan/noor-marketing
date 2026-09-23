const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/estimateController');

router.use(protect);

router.post('/', ctrl.createEstimate);
router.get('/', ctrl.getEstimates);
router.get('/:id', ctrl.getEstimateById);
router.put('/:id/approve', authorize('Manager', 'Boss', 'Admin'), ctrl.approveEstimate);
router.put('/:id/reject', authorize('Manager', 'Boss', 'Admin'), ctrl.rejectEstimate);
router.post('/:id/convert', ctrl.convertEstimateToOrder);

module.exports = router;
