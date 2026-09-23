const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
    recordPayment,
    getEODReport,
    getPayments,
    updatePaymentStatus
} = require('../controllers/paymentController');

router.use(protect);

router.post('/', recordPayment);
router.get('/', getPayments);
router.get('/eod-report', getEODReport);
router.patch('/:id/status', authorize('Admin', 'Boss', 'Manager'), updatePaymentStatus);

module.exports = router;
