const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAuditLogs
} = require('../controllers/userController');

router.use(protect);

router.get('/', authorize('Admin', 'Boss'), getAllUsers);
router.post('/', authorize('Admin', 'Boss'), createUser);
router.put('/:id', authorize('Admin', 'Boss'), updateUser);
router.delete('/:id', authorize('Admin', 'Boss'), deleteUser);
router.get('/audit-logs', authorize('Admin', 'Boss'), getAuditLogs);

module.exports = router;
