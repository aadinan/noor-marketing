const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/projectOrderController');

router.use(protect);

router.post('/', ctrl.createProjectQuotation);
router.get('/', ctrl.getProjectOrders);
router.get('/:id', ctrl.getProjectOrderById);
router.put('/:id/approve', authorize('Manager', 'Boss', 'Admin'), ctrl.approveProjectOrder);
router.put('/:id/reject', authorize('Manager', 'Boss', 'Admin'), ctrl.rejectProjectOrder);
router.post('/:id/convert', ctrl.convertProjectToActiveOrder);

module.exports = router;
