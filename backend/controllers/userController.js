const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// --- HELPER: Internal Audit Logger ---
// We use this internally so we don't repeat code
const logAction = async (action, actorId, targetId, details, ip) => {
  await AuditLog.create({
    action,
    performedBy: actorId,
    targetId,
    details,
    ipAddress: ip
  });
};

// @desc    Get All Users (Admin Only)
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    // Hide passwords from the result
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create New Staff Member
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "Username already taken" });

    // 2. Create User (Password hashing happens in Model pre-save)
    const newUser = await User.create({ username, password, role });

    // 3. AUDIT LOG: Record who hired this person
    await logAction(
      'USER_CREATED', 
      req.user.id, 
      newUser._id, 
      { role: newUser.role, username: newUser.username },
      req.ip
    );

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update User Role or Password
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { role, password } = req.body;
    const oldRole = user.role;

    // Update Fields
    if (role) user.role = role;
    if (password) user.password = password; // Will be re-hashed by Model

    await user.save();

    // 4. AUDIT LOG: Record the change
    await logAction(
      'USER_UPDATED',
      req.user.id,
      user._id,
      { change: `Role changed from ${oldRole} to ${role || oldRole}` },
      req.ip
    );

    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete User (Fire Staff)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot delete yourself!" });
    }

    await user.deleteOne();

    // 5. AUDIT LOG: Critical Action
    await logAction(
      'USER_DELETED',
      req.user.id,
      user._id,
      { deletedUsername: user.username, role: user.role },
      req.ip
    );

    res.json({ message: "User removed from system" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get Audit Logs (For Admin Dashboard)
// @route   GET /api/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'username role') // Show who did it
      .sort({ createdAt: -1 })
      .limit(100); // Only show last 100 actions to keep it fast
      
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};