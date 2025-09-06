const express = require('express');
const router = express.Router();
const WardrobeItem = require('../models/WardrobeItem');

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token.' });
  try {
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../config/database');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// GET /api/recommendations/outfit - Generate outfit recommendations
router.get('/outfit', auth, async (req, res) => {
  try {
    console.log('🎯 Generating outfit recommendations...');
    const { occasion, weather, style, limit = 5 } = req.query;
    const userId = req.userId;

    // Get user's wardrobe items
    const userItems = await WardrobeItem.find({ userId }).lean();
    console.log(`👕 Found ${userItems.length} wardrobe items for user`);

    if (userItems.length === 0) {
      return res.json({ 
        message: 'No wardrobe items found. Add some clothes to get outfit recommendations!',
        recommendations: [] 
      });
    }

    // Generate recommendations
    const recommendations = generateOutfitRecommendations(
      userItems, 
      { occasion, weather, style }, 
      parseInt(limit)
    );

    console.log(`✨ Generated ${recommendations.length} outfit recommendations`);
    res.json({ recommendations });
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
  }
});

// GET /api/recommendations/categories - Get available filter options
router.get('/categories', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const userItems = await WardrobeItem.find({ userId }).lean();

    // Extract unique values from user's wardrobe
    const occasions = [...new Set(userItems.flatMap(item => item.occasions || []))];
    const weathers = [...new Set(userItems.map(item => item.weather).filter(Boolean))];
    const styles = [...new Set(userItems.map(item => item.style).filter(Boolean))];

    res.json({
      occasions: occasions.length > 0 ? occasions : ['Casual', 'Work', 'Party', 'Sports', 'Formal'],
      weathers: weathers.length > 0 ? weathers : ['Sunny', 'Rainy', 'Cold', 'Warm', 'Cloudy'],
      styles: styles.length > 0 ? styles : ['Casual', 'Formal', 'Sporty', 'Vintage', 'Minimalist']
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

function generateOutfitRecommendations(items, preferences, limit) {
  const { occasion, weather, style } = preferences;
  const ensureCategory = (item) => (item.category || '').toLowerCase();
  
  // Score all items based on preferences
  const scoredItems = items.map(item => {
    let score = 10; // Base score
    
    // Weather compatibility (high priority)
    if (weather && item.weather) {
      if (item.weather.toLowerCase() === weather.toLowerCase()) {
        score += 25;
      } else if (isWeatherCompatible(item.weather, weather)) {
        score += 15;
      }
    }
    
    // Occasion matching
    if (occasion && item.occasions && item.occasions.length > 0) {
      if (item.occasions.some(occ => occ.toLowerCase() === occasion.toLowerCase())) {
        score += 20;
      }
    }
    
    // Style preference
    if (style && item.style) {
      if (item.style.toLowerCase() === style.toLowerCase()) {
        score += 15;
      }
    }
    
    return { ...item, score };
  });
  
  // Group by category
  const tops = scoredItems.filter(item => {
    const cats = (item.categories || []).map(c => c.toLowerCase());
    const cat = ensureCategory(item);
    return cats.some(c => ['t-shirt','shirt','blouse','sweater','jacket','hoodie','tops','top'].some(k => c.includes(k))) ||
           ['t-shirt','shirt','blouse','sweater','jacket','hoodie','tops','top'].some(k => cat.includes(k));
  }).sort((a, b) => b.score - a.score);
  
  const bottoms = scoredItems.filter(item => {
    const cats = (item.categories || []).map(c => c.toLowerCase());
    const cat = ensureCategory(item);
    return cats.some(c => ['jeans','trousers','shorts','skirt','leggings','joggers','bottoms','bottom'].some(k => c.includes(k))) ||
           ['jeans','trousers','shorts','skirt','leggings','joggers','bottoms','bottom'].some(k => cat.includes(k));
  }).sort((a, b) => b.score - a.score);
  
  const shoes = scoredItems.filter(item => {
    const cats = (item.categories || []).map(c => c.toLowerCase());
    const cat = ensureCategory(item);
    return cats.some(c => ['sneakers','heels','boots','sandals','flats','loafers','shoes','shoe'].some(k => c.includes(k))) ||
           ['sneakers','heels','boots','sandals','flats','loafers','shoes','shoe'].some(k => cat.includes(k));
  }).sort((a, b) => b.score - a.score);
  
  const accessories = scoredItems.filter(item => {
    const cats = (item.categories || []).map(c => c.toLowerCase());
    const cat = ensureCategory(item);
    return cats.some(c => ['bags','jewelry','belt','scarf','hat','sunglasses','accessories','accessory','umbrella'].some(k => c.includes(k))) ||
           ['bags','jewelry','belt','scarf','hat','sunglasses','accessories','accessory','umbrella'].some(k => cat.includes(k));
  }).sort((a, b) => b.score - a.score);
  
  // Generate outfit combinations
  const outfits = [];
  const maxOutfits = Math.min(limit, 10);
  
  for (let i = 0; i < maxOutfits; i++) {
    const outfit = {
      id: `outfit_${Date.now()}_${i}`,
      items: [],
      totalScore: 0,
      confidence: 0
    };
    
    // Select items
    if (tops.length > 0) outfit.items.push({ ...tops[i % tops.length], role: 'top' });
    if (bottoms.length > 0) outfit.items.push({ ...bottoms[i % bottoms.length], role: 'bottom' });
    if (shoes.length > 0) outfit.items.push({ ...shoes[i % shoes.length], role: 'shoes' });
    
    // Add accessories (max 2)
    const accessoryCount = Math.min(2, accessories.length);
    for (let j = 0; j < accessoryCount; j++) {
      const accIndex = (i + j) % accessories.length;
      if (accessories[accIndex]) {
        outfit.items.push({ ...accessories[accIndex], role: 'accessory' });
      }
    }
    
    // Calculate metrics
    // Require complete look: top, bottom, shoes, and at least 1 accessory
    const hasTop = outfit.items.some(it => it.role === 'top');
    const hasBottom = outfit.items.some(it => it.role === 'bottom');
    const hasShoes = outfit.items.some(it => it.role === 'shoes');
    const hasAccessory = outfit.items.some(it => it.role === 'accessory');

    if (hasTop && hasBottom && hasShoes && hasAccessory) {
      outfit.totalScore = outfit.items.reduce((sum, item) => sum + item.score, 0) / outfit.items.length;
      outfit.confidence = calculateConfidence(outfit.items, preferences);
      outfits.push(outfit);
    }
  }
  
  return outfits.sort((a, b) => b.totalScore - a.totalScore);
}

function isWeatherCompatible(itemWeather, targetWeather) {
  const compatibilityMap = {
    'cold': ['cloudy', 'rainy'],
    'warm': ['sunny', 'cloudy'],
    'sunny': ['warm'],
    'rainy': ['cold', 'cloudy'],
    'cloudy': ['cold', 'warm', 'rainy']
  };
  
  return compatibilityMap[itemWeather.toLowerCase()]?.includes(targetWeather.toLowerCase()) || false;
}

function calculateConfidence(items, preferences) {
  let confidence = 0;
  
  // Weather consistency
  if (preferences.weather) {
    const weatherMatch = items.filter(item => 
      item.weather && (
        item.weather.toLowerCase() === preferences.weather.toLowerCase() ||
        isWeatherCompatible(item.weather, preferences.weather)
      )
    ).length;
    confidence += (weatherMatch / items.length) * 40;
  }
  
  // Style consistency
  if (preferences.style) {
    const styleMatch = items.filter(item => 
      item.style && item.style.toLowerCase() === preferences.style.toLowerCase()
    ).length;
    confidence += (styleMatch / items.length) * 30;
  }
  
  // Occasion appropriateness
  if (preferences.occasion) {
    const occasionMatch = items.filter(item => 
      item.occasions && item.occasions.some(occ => 
        occ.toLowerCase() === preferences.occasion.toLowerCase()
      )
    ).length;
    confidence += (occasionMatch / items.length) * 30;
  }
  
  return Math.min(Math.round(confidence), 100);
}

module.exports = router;