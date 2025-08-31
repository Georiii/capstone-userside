import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_ENDPOINTS } from '../config/api';

interface WardrobeItem {
  _id: string;
  clothName: string;
  description: string;
  imageUrl: string;
  category: string;
  weather: string;
  color: string;
  style: string;
  categories?: string[]; // Added for new filtering logic
}

export default function CombineOutfits() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  
  // Enhanced filter states for AI recommendations
  const [selectedTopCategory, setSelectedTopCategory] = useState<string>('');
  const [selectedBottomCategory, setSelectedBottomCategory] = useState<string>('');
  const [selectedWeather, setSelectedWeather] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [useAIRecommendations, setUseAIRecommendations] = useState<boolean>(true);
  const [useWeatherAPI, setUseWeatherAPI] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<string>('');

  // Available options - Updated to match actual wardrobe categories
  const topCategories = ['T-shirt', 'Formals', 'Jackets/sweatshirt', 'Shirt/camisole'];
  const bottomCategories = ['Jeans', 'Trousers', 'Shorts', 'Skirts', 'Leggings', 'Joggers'];
  const weatherOptions = ['Sunny', 'Rainy', 'Cold', 'Warm', 'Cloudy'];
  const occasionOptions = ['Casual', 'Work', 'Party', 'Sports', 'Formal', 'Birthdays', 'Weddings'];
  const styleOptions = ['Casual', 'Formal', 'Sporty', 'Vintage', 'Minimalist', 'Streetwear'];

  useEffect(() => {
    loadWardrobeItems();
  }, []);

  const loadWardrobeItems = async () => {
    console.log('🔍 Loading wardrobe items...');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        Alert.alert('Error', 'Please login to access wardrobe items');
        return;
      }

      console.log('🔍 Token found, making API request to:', API_ENDPOINTS.wardrobe);
      const response = await fetch(API_ENDPOINTS.wardrobe, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 API response status:', response.status);
      console.log('🔍 API response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Raw API response:', data);
        
        let items = [];
        if (data.items) {
          items = data.items;
          console.log('🔍 Found items in data.items');
        } else if (data.wardrobeItems) {
          items = data.wardrobeItems;
          console.log('🔍 Found items in data.wardrobeItems');
        } else if (Array.isArray(data)) {
          items = data;
          console.log('🔍 Found items as direct array');
        } else {
          console.log('❌ No items found in response data');
        }
        
        console.log('✅ Loaded wardrobe items:', items.length);
        if (items.length > 0) {
          console.log('🔍 Sample item:', items[0]);
          console.log('🔍 Available categories:', [...new Set(items.map((item: WardrobeItem) => item.category))]);
          console.log('🔍 Available weather options:', [...new Set(items.map((item: WardrobeItem) => item.weather))]);
          console.log('🔍 All items with their categories:');
          items.forEach((item: WardrobeItem, index: number) => {
            console.log(`  Item ${index + 1}: "${item.clothName}" - Category: "${item.category}" - Weather: "${item.weather}"`);
          });
        }
        setWardrobeItems(items);
      } else {
        console.log('❌ API request failed');
        Alert.alert('Error', 'Failed to load wardrobe items');
      }
    } catch (error) {
      console.error('❌ Error loading wardrobe items:', error);
      Alert.alert('Error', 'Failed to load wardrobe items');
    }
  };

  // Simple category selection - only one can be selected at a time
  const selectTopCategory = (category: string) => {
    setSelectedTopCategory(selectedTopCategory === category ? '' : category);
  };

  const selectBottomCategory = (category: string) => {
    setSelectedBottomCategory(selectedBottomCategory === category ? '' : category);
  };

  const selectWeather = (weather: string) => {
    setSelectedWeather(selectedWeather === weather ? '' : weather);
  };

  const selectOccasion = (occasion: string) => {
    setSelectedOccasion(selectedOccasion === occasion ? '' : occasion);
  };

  const selectStyle = (style: string) => {
    setSelectedStyle(selectedStyle === style ? '' : style);
  };

  const handleWeatherAPIToggle = () => {
    if (!useWeatherAPI) {
      Alert.alert(
        'Enable Weather API?',
        'This will use real-time weather data to suggest appropriate outfits for your location. Weather data is provided by OpenWeatherMap.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Enable',
            onPress: () => {
              setUseWeatherAPI(true);
              Alert.alert(
                'Location Required',
                'Please enter your location (e.g., "Manila, Philippines") to get weather-aware recommendations.',
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    } else {
      setUseWeatherAPI(false);
      setUserLocation('');
    }
  };

  // Enhanced function - Generate AI-powered outfit suggestions
  const generateOutfits = async () => {
    console.log('🤖 AI-Powered outfit generation started!');
    console.log('🔍 Current selections:', { 
      selectedTopCategory, 
      selectedBottomCategory, 
      selectedWeather, 
      selectedOccasion, 
      selectedStyle, 
      useAIRecommendations 
    });
    
    setLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to generate outfit recommendations');
        setLoading(false);
        return;
      }

      // Use AI recommendation system if enabled
      if (useAIRecommendations) {
        console.log('🤖 Using AI recommendation system...');
        
        let weatherToUse = selectedWeather;
        
        // Get real-time weather if enabled
        if (useWeatherAPI && userLocation.trim()) {
          console.log('🌤️ Fetching real-time weather for:', userLocation);
          try {
            const weatherResponse = await fetch(`${API_ENDPOINTS.baseUrl}/api/weather/current?location=${encodeURIComponent(userLocation.trim())}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (weatherResponse.ok) {
              const weatherData = await weatherResponse.json();
              console.log('✅ Real-time weather data:', weatherData);
              weatherToUse = weatherData.weather;
              
              Alert.alert(
                'Weather Update',
                `Current weather in ${weatherData.location}: ${weatherData.description} (${weatherData.temperature}°C)\nUsing "${weatherData.weather}" for outfit recommendations.`,
                [{ text: 'OK' }]
              );
            } else {
              console.log('⚠️ Weather API failed, using manual selection');
            }
          } catch (weatherError) {
            console.log('⚠️ Weather API error, using manual selection:', weatherError);
          }
        }
        
        // Build query parameters for AI recommendations
        const params = new URLSearchParams();
        if (weatherToUse) params.append('weather', weatherToUse);
        if (selectedOccasion) params.append('occasion', selectedOccasion);
        if (selectedStyle) params.append('style', selectedStyle);
        params.append('limit', '8');

        console.log('📡 Making AI recommendation request:', `${API_ENDPOINTS.baseUrl}/api/recommendations/outfit?${params.toString()}`);
        
        const response = await fetch(`${API_ENDPOINTS.baseUrl}/api/recommendations/outfit?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ AI recommendations received:', data.recommendations?.length || 0, 'outfits');
          
          if (data.recommendations && data.recommendations.length > 0) {
            // Convert AI recommendations to the format expected by outfit-suggestions.tsx
            const formattedOutfits = data.recommendations.map((aiOutfit: any, index: number) => {
              // Find top and bottom items from the AI recommendation
              const topItem = aiOutfit.items?.find((item: any) => item.role === 'top');
              const bottomItem = aiOutfit.items?.find((item: any) => item.role === 'bottom');
              const shoesItem = aiOutfit.items?.find((item: any) => item.role === 'shoes');
              const accessories = aiOutfit.items?.filter((item: any) => item.role === 'accessory') || [];

              if (!topItem || !bottomItem) {
                console.log('⚠️ Skipping incomplete outfit:', aiOutfit.id);
                return null;
              }

              return {
                id: aiOutfit.id || `ai-outfit-${index + 1}`,
                name: `AI Outfit ${index + 1}`,
                top: {
                  _id: topItem._id,
                  clothName: topItem.clothName,
                  description: topItem.description || '',
                  imageUrl: topItem.imageUrl,
                  category: topItem.category || '',
                  weather: topItem.weather || '',
                  color: topItem.color || '',
                  style: topItem.style || ''
                },
                bottom: {
                  _id: bottomItem._id,
                  clothName: bottomItem.clothName,
                  description: bottomItem.description || '',
                  imageUrl: bottomItem.imageUrl,
                  category: bottomItem.category || '',
                  weather: bottomItem.weather || '',
                  color: bottomItem.color || '',
                  style: bottomItem.style || ''
                },
                shoes: shoesItem ? {
                  _id: shoesItem._id,
                  clothName: shoesItem.clothName,
                  description: shoesItem.description || '',
                  imageUrl: shoesItem.imageUrl,
                  category: shoesItem.category || '',
                  weather: shoesItem.weather || '',
                  color: shoesItem.color || '',
                  style: shoesItem.style || ''
                } : null,
                accessories: accessories.map((acc: any) => ({
                  _id: acc._id,
                  clothName: acc.clothName,
                  description: acc.description || '',
                  imageUrl: acc.imageUrl,
                  category: acc.category || '',
                  weather: acc.weather || '',
                  color: acc.color || '',
                  style: acc.style || ''
                })),
                weather: selectedWeather || aiOutfit.weatherSuitability || 'Good',
                occasion: selectedOccasion || 'Casual',
                confidence: aiOutfit.confidence || 0,
                aiGenerated: true,
                totalScore: aiOutfit.totalScore || 0,
                styleCoherence: aiOutfit.styleCoherence || 'Good',
                weatherSuitability: aiOutfit.weatherSuitability || 'Good',
                occasionMatch: aiOutfit.occasionMatch || 'Good'
              };
            }).filter((outfit: any) => outfit !== null);

            if (formattedOutfits.length > 0) {
              console.log('✅ Formatted AI outfits:', formattedOutfits.length);
              await AsyncStorage.setItem('generatedOutfits', JSON.stringify(formattedOutfits));
              console.log('✅ AI outfits saved to AsyncStorage');
              (router as any).push('/outfit-suggestions');
              setLoading(false);
              return;
            }
          }
        } else {
          console.log('⚠️ AI recommendation failed, falling back to manual system');
        }
      }

      // Fallback to manual system (your original logic)
      console.log('🔧 Using manual combination system...');
      
      if (!selectedTopCategory || !selectedBottomCategory) {
        Alert.alert('Selection Required', 'Please select categories for tops and bottoms, or enable AI recommendations');
        setLoading(false);
        return;
      }

      // Your original manual logic here (simplified)
      const availableTops = wardrobeItems.filter(item => {
        const matchesCategory = (item.categories && item.categories.includes(selectedTopCategory)) ||
                               (item.category === selectedTopCategory);
        const matchesWeather = !selectedWeather || !item.weather || item.weather === selectedWeather;
        return matchesCategory && matchesWeather;
      });
      
      const availableBottoms = wardrobeItems.filter(item => {
        const matchesCategory = (item.categories && item.categories.includes(selectedBottomCategory)) ||
                               (item.category === selectedBottomCategory);
        const matchesWeather = !selectedWeather || !item.weather || item.weather === selectedWeather;
        return matchesCategory && matchesWeather;
      });

      if (availableTops.length === 0 || availableBottoms.length === 0) {
        Alert.alert('No Combinations', 'No items found for the selected criteria. Try different selections or enable AI recommendations.');
        setLoading(false);
        return;
      }

      // Generate manual combinations (limited)
      const outfitCombinations = [];
      const maxOutfits = Math.min(6, availableTops.length * availableBottoms.length);
      
      let outfitCount = 0;
      for (let i = 0; i < availableTops.length && outfitCount < maxOutfits; i++) {
        for (let j = 0; j < availableBottoms.length && outfitCount < maxOutfits; j++) {
          const outfit = {
            id: `manual-outfit-${outfitCount + 1}`,
            name: `Manual Outfit ${outfitCount + 1}`,
            top: availableTops[i],
            bottom: availableBottoms[j],
            weather: selectedWeather || 'Moderate',
            occasion: selectedOccasion || determineOccasion(availableTops[i], availableBottoms[j]),
            aiGenerated: false,
            confidence: 75 // Fixed confidence for manual combinations
          };
          outfitCombinations.push(outfit);
          outfitCount++;
        }
      }

      console.log('✅ Generated manual outfits:', outfitCombinations.length);
      await AsyncStorage.setItem('generatedOutfits', JSON.stringify(outfitCombinations));
      (router as any).push('/outfit-suggestions');
      
    } catch (error) {
      console.error('❌ Error generating outfits:', error);
      Alert.alert('Error', 'Failed to generate outfit suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const determineOccasion = (top: WardrobeItem, bottom: WardrobeItem) => {
    if (top.category === 'Formals' || bottom.category === 'Formals') return 'Work/Formal';
    if (top.category === 'Jackets' || top.category === 'Sweaters') return 'Casual';
    return 'Casual';
  };

  const renderCheckboxItem = (item: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity style={styles.checkboxItem} onPress={onPress}>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </View>
      <Text style={styles.checkboxText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => (router as any).push('/profile')}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Combine</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* For Tops Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>For tops</Text>
          <View style={styles.filterRow}>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Categories</Text>
              <View style={styles.checkboxGrid}>
                {topCategories.map((category) => 
                  renderCheckboxItem(
                    category, 
                    selectedTopCategory === category, 
                    () => selectTopCategory(category)
                  )
                )}
              </View>
            </View>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Weather</Text>
              <View style={styles.checkboxGrid}>
                {weatherOptions.map((weather) => 
                  renderCheckboxItem(
                    weather, 
                    selectedWeather === weather, 
                    () => selectWeather(weather)
                  )
                )}
              </View>
            </View>
          </View>
        </View>

        {/* For Bottoms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>For Bottoms</Text>
          <View style={styles.filterRow}>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Categories</Text>
              <View style={styles.checkboxGrid}>
                {bottomCategories.map((category) => 
                  renderCheckboxItem(
                    category, 
                    selectedBottomCategory === category, 
                    () => selectBottomCategory(category)
                  )
                )}
              </View>
            </View>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>Weather</Text>
              <View style={styles.checkboxGrid}>
                {weatherOptions.map((weather) => 
                  renderCheckboxItem(
                    weather, 
                    selectedWeather === weather, 
                    () => selectWeather(weather)
                  )
                )}
              </View>
            </View>
          </View>
        </View>

        {/* AI Toggle Section */}
        <View style={styles.section}>
          <View style={styles.aiToggleContainer}>
            <Text style={styles.sectionTitle}>🤖 AI-Powered Recommendations</Text>
            <TouchableOpacity 
              style={[styles.aiToggle, useAIRecommendations && styles.aiToggleActive]}
              onPress={() => setUseAIRecommendations(!useAIRecommendations)}
            >
              <Text style={[styles.aiToggleText, useAIRecommendations && styles.aiToggleTextActive]}>
                {useAIRecommendations ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aiDescription}>
            {useAIRecommendations 
              ? 'AI will create smart outfit combinations based on your preferences and wardrobe items.'
              : 'Manual mode: Select specific categories to generate basic combinations.'
            }
          </Text>
        </View>

        {/* Weather API Section - Only show if AI is enabled */}
        {useAIRecommendations && (
          <View style={styles.section}>
            <View style={styles.aiToggleContainer}>
              <Text style={styles.sectionTitle}>🌤️ Real-time Weather</Text>
              <TouchableOpacity 
                style={[styles.aiToggle, useWeatherAPI && styles.aiToggleActive]}
                onPress={handleWeatherAPIToggle}
              >
                <Text style={[styles.aiToggleText, useWeatherAPI && styles.aiToggleTextActive]}>
                  {useWeatherAPI ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
            {useWeatherAPI && (
              <View style={styles.locationInputContainer}>
                <Text style={styles.locationLabel}>Your Location:</Text>
                <TextInput
                  style={styles.locationInput}
                  placeholder="e.g., Manila, Philippines"
                  value={userLocation}
                  onChangeText={setUserLocation}
                  placeholderTextColor="#999"
                />
                <Text style={styles.locationHint}>
                  💡 Weather API will automatically select the best weather condition for your outfits
                </Text>
              </View>
            )}
          </View>
        )}

        {/* AI Options - Only show if AI is enabled */}
        {useAIRecommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Preferences</Text>
            
            {/* Occasion Selection */}
            <View style={styles.filterRow}>
              <View style={styles.filterColumn}>
                <Text style={styles.filterLabel}>Occasion</Text>
                <View style={styles.checkboxGrid}>
                  {occasionOptions.slice(0, 4).map((occasion) => 
                    renderCheckboxItem(
                      occasion, 
                      selectedOccasion === occasion, 
                      () => selectOccasion(occasion)
                    )
                  )}
                </View>
              </View>
              <View style={styles.filterColumn}>
                <Text style={styles.filterLabel}>Style</Text>
                <View style={styles.checkboxGrid}>
                  {styleOptions.slice(0, 4).map((style) => 
                    renderCheckboxItem(
                      style, 
                      selectedStyle === style, 
                      () => selectStyle(style)
                    )
                  )}
                </View>
              </View>
            </View>

            {/* Weather for AI */}
            <View style={styles.filterRow}>
              <View style={styles.filterColumn}>
                <Text style={styles.filterLabel}>Weather</Text>
                <View style={styles.checkboxGrid}>
                  {weatherOptions.map((weather) => 
                    renderCheckboxItem(
                      weather, 
                      selectedWeather === weather, 
                      () => selectWeather(weather)
                    )
                  )}
                </View>
              </View>
              <View style={styles.filterColumn}>
                <Text style={styles.aiHint}>💡 Tip: AI works best with weather and occasion selected!</Text>
              </View>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={generateOutfits}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {useAIRecommendations ? '🤖 Generate AI Outfits' : '🔧 Generate Manual Outfits'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4C2C2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F4C2C2',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  checkboxGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 3,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#000000',
  },
  checkboxText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#E8B4C8',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 50,
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 40,
    minWidth: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  aiToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiToggle: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  aiToggleActive: {
    backgroundColor: '#4CAF50',
  },
  aiToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  aiToggleTextActive: {
    color: '#FFFFFF',
  },
  aiDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 20,
  },
  aiHint: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
  locationInputContainer: {
    marginTop: 15,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  locationInput: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  locationHint: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
