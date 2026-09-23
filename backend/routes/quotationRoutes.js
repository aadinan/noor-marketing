const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createQuotation,
  approveQuotation,
  convertQuoteToOrder,
  getQuotations,
  getQuotationById,
  rejectQuotation
} = require('../controllers/quotationController');

router.use(protect);

router.post('/', createQuotation);
router.get('/', getQuotations);
router.get('/:id', getQuotationById);
router.put('/:id/approve', authorize('Admin', 'Boss', 'Manager'), approveQuotation);
router.put('/:id/reject', authorize('Admin', 'Boss', 'Manager'), rejectQuotation);
router.post('/:id/convert', convertQuoteToOrder);

module.exports = router;