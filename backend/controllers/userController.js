const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Only the account owner or an admin can change / delete a user
const canManageUser = (req, userId) =>
  req.user.role === 'admin' || req.user.id === String(userId);

// GET /api/users - get all users (password is never returned)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id - get one user by id
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid user id' });

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/:id - update a user (owner or admin)
exports.updateUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid user id' });

    if (!canManageUser(req, req.params.id))
      return res.status(403).json({ message: 'Access denied: you can only update your own account' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, password, role } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    // Only an admin can change a user's role
    if (role !== undefined) {
      if (req.user.role !== 'admin')
        return res.status(403).json({ message: 'Access denied: only an admin can change roles' });
      user.role = role;
    }

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json({ message: 'User updated successfully', user: updated });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already in use' });
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/users/:id - delete a user (owner or admin)
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid user id' });

    if (!canManageUser(req, req.params.id))
      return res.status(403).json({ message: 'Access denied: you can only delete your own account' });

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
