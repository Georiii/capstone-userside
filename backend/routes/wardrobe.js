const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/database');
const WardrobeItem = require('../models/WardrobeItem');
const User = require('../models/User');
const MarketplaceItem = require('../models/MarketplaceItem');
const cloudinary = require('../config/cloudinary');

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

// Upload image to Cloudinary
router.post('/upload-image', auth, async (req, res) => {
  try {
    const { imageUrl, folder = 'glamora/wardrobe' } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required.' });
    }

    // Upload to Cloudinary with optimization
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      transformation: [
        { width: 400, height: 500, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });

  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ message: 'Failed to upload image.', error: err.message });
  }
});

// Add wardrobe item with Cloudinary optimization
router.post('/add', auth, async (req, res) => {
  try {
    console.log('🔍 Adding wardrobe item...');
    console.log('📝 Request body:', req.body);
    console.log('👤 User ID:', req.userId);
    
    const { imageUrl, clothName, description, categories, occasions, category, weather, style, color } = req.body;
    
    if (!imageUrl || !clothName) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'imageUrl and clothName are required.' });
    }

    // Try to upload to Cloudinary, but continue if it fails
    let optimizedImageUrl = imageUrl;
    if (imageUrl && (imageUrl.startsWith('file://') || imageUrl.startsWith('data:'))) {
      try {
        console.log('☁️ Attempting Cloudinary upload...');
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: 'glamora/wardrobe',
          transformation: [
            { width: 400, height: 500, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        optimizedImageUrl = result.secure_url;
        console.log('✅ Cloudinary upload successful:', optimizedImageUrl);
      } catch (uploadErr) {
        console.error('❌ Cloudinary upload failed, using original image:', uploadErr.message);
        // Continue with original URL - don't let Cloudinary failure stop the process
        optimizedImageUrl = imageUrl;
      }
    } else {
      console.log('📝 Using provided image URL (not a local file)');
    }

    console.log('💾 Creating WardrobeItem...');
    const item = new WardrobeItem({
      userId: req.userId,
      imageUrl: optimizedImageUrl,
      clothName,
      description,
      categories,
      occasions,
      category,
      weather,
      style,
      color,
    });
    
    console.log('💾 Saving to database...');
    await item.save();
    console.log('✅ Wardrobe item saved successfully:', item._id);
    
    res.status(201).json({ message: 'Wardrobe item saved.', item });
  } catch (err) {
    console.error('❌ Error saving wardrobe item:', err);
    res.status(500).json({ message: 'Failed to save item.', error: err.message });
  }
});

// Get all wardrobe items for user
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching wardrobe items...');
    console.log('👤 User ID:', req.userId);
    
    const items = await WardrobeItem.find({ userId: req.userId }).sort({ createdAt: -1 });
    console.log(`📊 Found ${items.length} wardrobe items for user`);
    
    res.json({ items });
  } catch (err) {
    console.error('❌ Error fetching wardrobe items:', err);
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

// POST /api/marketplace - add a new marketplace item
router.post('/marketplace', auth, async (req, res) => {
  try {
    const { imageUrl, name, description, price } = req.body;
    if (!imageUrl || !name || !price) return res.status(400).json({ message: 'Missing required fields' });
    
    // Get user information from database
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const item = new MarketplaceItem({
      imageUrl,
      name,
      description,
      price,
      userId: req.userId,
      userName: user.name || '',
      userEmail: user.email || '',
    });
    await item.save();
    res.status(201).json({ message: 'Marketplace item posted', item });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/marketplace - list all marketplace items (with optional search)
router.get('/marketplace', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const items = await MarketplaceItem.find(query).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/marketplace/user - get marketplace items posted by the current user
router.get('/marketplace/user', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching user marketplace posts...');
    console.log('👤 User ID:', req.userId);
    
    const items = await MarketplaceItem.find({ userId: req.userId }).sort({ createdAt: -1 });
    console.log(`📊 Found ${items.length} marketplace posts for user`);
    
    res.json({ items });
  } catch (err) {
    console.error('❌ Error fetching user marketplace posts:', err);
    res.status(500).json({ message: 'Failed to fetch user posts.', error: err.message });
  }
});

// PUT /api/marketplace/:id - update a marketplace item
router.put('/marketplace/:id', auth, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const item = await MarketplaceItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, description, price },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found or you do not have permission to edit it' });
    }

    res.json({ message: 'Item updated successfully', item });
  } catch (err) {
    console.error('❌ Error updating marketplace item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/marketplace/:id - delete a marketplace item
router.delete('/marketplace/:id', auth, async (req, res) => {
  try {
    const item = await MarketplaceItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 