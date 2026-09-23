const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/deliveryController');

router.use(protect);

router.get('/', ctrl.getDeliveryList);
router.get('/all', authorize('Manager', 'Boss', 'Admin'), ctrl.getAllDeliveries);
router.get('/history', ctrl.getDeliveryHistory);
router.patch('/:id/deliver', ctrl.markDelivered);

module.exports = router;
