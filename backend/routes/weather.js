const express = require('express');
const router = express.Router();

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

// GET /api/weather/current - Get current weather for location
router.get('/current', auth, async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({ 
        message: 'Location is required',
        example: '/api/weather/current?location=Manila'
      });
    }

    // Check if weather API is configured
    const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!WEATHER_API_KEY) {
      console.log('⚠️ Weather API key not configured, returning mock data');
      return res.json({
        location: location,
        weather: 'Warm',
        temperature: 28,
        description: 'Partly cloudy',
        humidity: 65,
        source: 'mock',
        message: 'Weather API not configured. Using default warm weather.',
        recommendation: 'Good for light, breathable clothing'
      });
    }

    // Make request to OpenWeatherMap API
    const axios = require('axios');
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`;
    
    console.log('🌤️ Fetching weather data for:', location);
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;
    
    // Convert OpenWeatherMap data to our categories
    const temperature = weatherData.main.temp;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const description = weatherData.weather[0].description;
    
    let weatherCategory = 'Warm';
    let recommendation = 'Comfortable clothing recommended';
    
    // Temperature-based categorization
    if (temperature < 15) {
      weatherCategory = 'Cold';
      recommendation = 'Warm layers and jackets recommended';
    } else if (temperature > 30) {
      weatherCategory = 'Warm';
      recommendation = 'Light, breathable clothing recommended';
    } else {
      weatherCategory = 'Warm';
      recommendation = 'Comfortable, moderate clothing recommended';
    }
    
    // Weather condition adjustments
    if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
      weatherCategory = 'Rainy';
      recommendation = 'Waterproof clothing and layers recommended';
    } else if (weatherMain.includes('cloud')) {
      if (temperature < 20) {
        weatherCategory = 'Cloudy';
        recommendation = 'Light layers recommended';
      }
    } else if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
      weatherCategory = 'Sunny';
      recommendation = 'Sun protection and light clothing recommended';
    }
    
    console.log('✅ Weather data processed:', {
      location,
      temperature,
      weatherCategory,
      description
    });
    
    res.json({
      location: weatherData.name,
      weather: weatherCategory,
      temperature: Math.round(temperature),
      description: description,
      humidity: weatherData.main.humidity,
      source: 'openweathermap',
      recommendation: recommendation,
      rawData: {
        main: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        temp: temperature,
        feels_like: weatherData.main.feels_like,
        humidity: weatherData.main.humidity
      }
    });
    
  } catch (error) {
    console.error('❌ Weather API error:', error.message);
    
    // Fallback to mock data on API failure
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        message: 'Location not found',
        suggestion: 'Try using a more specific location name (e.g., "Manila, Philippines")'
      });
    }
    
    // Generic fallback
    res.json({
      location: req.query.location || 'Unknown',
      weather: 'Warm',
      temperature: 25,
      description: 'Weather data unavailable',
      humidity: 60,
      source: 'fallback',
      message: 'Weather service unavailable. Using default settings.',
      recommendation: 'Comfortable clothing recommended',
      error: 'Weather API temporarily unavailable'
    });
  }
});

// GET /api/weather/recommendations - Get weather-aware outfit recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { location, occasion, style, limit = 5 } = req.query;
    
    // Get current weather
    const weatherResponse = await fetch(`${req.protocol}://${req.get('host')}/api/weather/current?location=${encodeURIComponent(location)}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    
    const weatherData = await weatherResponse.json();
    console.log('🌤️ Weather data for recommendations:', weatherData);
    
    // Get outfit recommendations based on weather
    const recommendationsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/recommendations/outfit?weather=${weatherData.weather}&occasion=${occasion}&style=${style}&limit=${limit}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    
    const recommendationsData = await recommendationsResponse.json();
    
    res.json({
      weather: weatherData,
      recommendations: recommendationsData.recommendations || [],
      message: `Found ${recommendationsData.recommendations?.length || 0} weather-appropriate outfits for ${weatherData.weather.toLowerCase()} conditions in ${weatherData.location}`
    });
    
  } catch (error) {
    console.error('❌ Weather recommendations error:', error);
    res.status(500).json({ 
      message: 'Failed to get weather-aware recommendations',
      error: error.message 
    });
  }
});

module.exports = router;
