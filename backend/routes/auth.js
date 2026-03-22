import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { role, username, email, password } = req.body;
    if (!role || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['ADMIN', 'STUDENT'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ role, username, email, password });
    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { role, email, password } = req.body;
    if (!role || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ email });
    if (!user || user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role,profilePic: user.profilePic },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      profilePic: req.user.profilePic
    },
  });
});

export default router;
