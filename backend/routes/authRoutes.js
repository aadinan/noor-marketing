const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { createUser } = require('../controllers/userController');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register
 * @desc    Create a new user (Admin only)
 * @access  Private
 */
router.post('/register', protect, authorize('Admin'), createUser);

/**
 * @route   POST /api/auth/register-admin
 * @desc    Create the first Admin user (Run via Postman)
 * @access  Public (For initial setup only)
 */
router.post('/register-admin', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Error: User already exists' });
    }

    // 2. Create user (This triggers the .pre('save') hook in User.js)
    const user = await User.create({
      username,
      password,
      role: 'Admin'
    });

    // 3. Respond with success
    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        username: user.username,
        role: user.role,
        message: "Admin account secured and created successfully"
      });
    }
  } catch (error) {
    console.error("Critical Registration Error:", error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Test protected route
 * @access  Private (Requires valid JWT)
 */
router.get('/profile', protect, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    role: req.user.role,
    message: "Security Verified: You have accessed a protected route!"
  });
});

module.exports = router;