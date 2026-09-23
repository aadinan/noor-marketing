const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['Boss', 'Admin', 'Manager', 'Warehouse', 'Salesman'], 
    default: 'Salesman'
  }
}, { timestamps: true });

/**
 * SECURITY GATE: Pre-save hook
 * Automatically hashes password before saving to MongoDB.
 * Note: Removed the 'next' parameter to solve the "next is not a function" error.
 */
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
});

/**
 * AUTHENTICATION HELPER
 * Compares plain text password from login with the hashed password in DB.
 */
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);