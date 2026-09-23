const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    requestLimitIncrease,
    approveCreditRequest,
    getPendingCreditRequests,
    rejectCreditRequest
} = require('../controllers/creditController');

router.use(protect);

router.post('/request', requestLimitIncrease);
router.get('/pending', authorize('Admin', 'Boss', 'Manager'), getPendingCreditRequests);
router.put('/:id/approve', authorize('Admin', 'Boss', 'Manager'), approveCreditRequest);
router.put('/:id/reject', authorize('Admin', 'Boss', 'Manager'), rejectCreditRequest);

module.exports = router;
