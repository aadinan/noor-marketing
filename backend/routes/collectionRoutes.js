const express = require('express');
const router = express.Router();
const {
  createCollection,
  getCollections,
  approveDiscount,
  getEodReport,
  getTodaysCollections
} = require('../controllers/collectionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All collection routes require login

// EOD Report - must be before /:id routes
router.get('/today', getTodaysCollections);
router.get('/eod-report', getEodReport);

// Approve spot discount
router.put('/:id/approve-discount', authorize('Manager', 'Boss'), approveDiscount);

// Standard CRUD
router.post('/', createCollection);
router.get('/', getCollections);

module.exports = router;