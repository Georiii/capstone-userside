const express = require('express');
const jwt = require('jsonwebtoken');
const WardrobeItem = require('../models/WardrobeItem');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Replace with process.env.JWT_SECRET in production

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Add wardrobe item
router.post('/add', auth, async (req, res) => {
  try {
    const { imageUrl, clothName, description, categories, occasions, category } = req.body;
    if (!imageUrl || !clothName) {
      return res.status(400).json({ message: 'imageUrl and clothName are required.' });
    }
    const item = new WardrobeItem({
      userId: req.userId,
      imageUrl,
      clothName,
      description,
      categories,
      occasions,
      category,
    });
    await item.save();
    res.status(201).json({ message: 'Wardrobe item saved.', item });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save item.', error: err.message });
  }
});

// Get all wardrobe items for user
router.get('/', auth, async (req, res) => {
  try {
    const items = await WardrobeItem.find({ userId: req.userId });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items.', error: err.message });
  }
});

// DELETE /api/wardrobe/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await WardrobeItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    // Optionally: delete image from storage if needed
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 