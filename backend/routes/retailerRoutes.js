const express = require('express');
const router = express.Router();

const { createRetailer, getRetailers, getRetailerById, updateRetailer, deleteRetailer, freezeCredit, getDormantRetailers } = require('../controllers/retailerController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes below this line
router.use(protect);

router.post('/', createRetailer);       // Add Shop
router.post('/quick-add', require('../controllers/retailerController').createRetailerQuick); // Minimal quick add
router.get('/dormant', getDormantRetailers); // Dormant Shops
router.get('/', getRetailers);          // List Shops
router.get('/:id', getRetailerById);    // Get Single Shop
router.put('/:id', updateRetailer);     // Update Shop
router.delete('/:id', deleteRetailer);  // Delete Shop
router.put('/:id/freeze', freezeCredit); // Freeze/Unfreeze Credit

module.exports = router;
