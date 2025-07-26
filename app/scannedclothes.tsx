import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScannedClothes() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
  const [clothName, setClothName] = useState('');
  const [description, setDescription] = useState('');
  const [wardrobeModal, setWardrobeModal] = useState(false);
  const [subcategoryModal, setSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [occasionModal, setOccasionModal] = useState(false);
  const [marketplaceModal, setMarketplaceModal] = useState(false);
  const [marketplaceName, setMarketplaceName] = useState('');
  const [marketplaceDescription, setMarketplaceDescription] = useState('');
  const [marketplacePrice, setMarketplacePrice] = useState('');
  const [loading, setLoading] = useState(false);

  // Category and subcategory mapping
  const categoryData = {
    'Tops': [
      { name: 'T-shirts', type: 'T-shirt' },
      { name: 'Formals', type: 'Formals' },
      { name: 'Jackets/sweatshirt', type: 'Jackets/sweatshirt' },
      { name: 'Shirt/camisole', type: 'Shirt/camisole' },
    ],
    'Bottoms': [
      { name: 'Jeans', type: 'Jeans' },
      { name: 'Trousers', type: 'Trousers' },
      { name: 'Shorts', type: 'Shorts' },
      { name: 'Skirts', type: 'Skirts' },
      { name: 'Leggings', type: 'Leggings' },
      { name: 'Joggers', type: 'Joggers' },
    ],
    'Shoes': [
      { name: 'Sneakers', type: 'Sneakers' },
      { name: 'Heels', type: 'Heels' },
      { name: 'Boots', type: 'Boots' },
      { name: 'Sandals', type: 'Sandals' },
      { name: 'Flats', type: 'Flats' },
      { name: 'Loafers', type: 'Loafers' },
    ],
    'Accessories': [
      { name: 'Bags', type: 'Bags' },
      { name: 'Jewelry', type: 'Jewelry' },
      { name: 'Belts', type: 'Belts' },
      { name: 'Scarves', type: 'Scarves' },
      { name: 'Hats', type: 'Hats' },
      { name: 'Sunglasses', type: 'Sunglasses' },
    ],
  };

  const occasionOptions = ['Birthdays', 'Weddings', 'Work', 'Casual', 'Party', 'Sports'];

  const handleAddToWardrobe = (): void => {
    setWardrobeModal(true);
  };

  const handlePostToMarketplace = (): void => {
    setMarketplaceModal(true);
  };

  const handleCategorySelect = (category: string): void => {
    setSelectedCategory(category);
    setWardrobeModal(false);
    setSubcategoryModal(true);
  };

  const handleSubcategorySelect = (subcategory: { name: string, type: string }): void => {
    // Allow multiple selections
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategory.type)) {
        return prev.filter(s => s !== subcategory.type);
      } else {
        return [...prev, subcategory.type];
      }
    });
  };

  const handleSubcategoryDone = (): void => {
    if (selectedSubcategories.length === 0) {
      Alert.alert('Error', 'Please select at least one subcategory');
      return;
    }
    setSubcategoryModal(false);
    setOccasionModal(true);
  };

  const handleOccasionSelect = (occasion: string): void => {
    setOccasions(prev => {
      if (prev.includes(occasion)) {
        return prev.filter(o => o !== occasion);
      } else {
        return [...prev, occasion];
      }
    });
  };

  const handleOccasionDone = (): void => {
    setOccasionModal(false);
    // Show save button after all selections are made
  };

  const handleMarketplaceSubmit = async (): Promise<void> => {
    if (!marketplaceName.trim() || !marketplacePrice.trim()) {
      Alert.alert('Error', 'Please enter name and price');
      return;
    }

    const price = parseFloat(marketplacePrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      if (!imageUri) throw new Error('No image found');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.7:3000/api/wardrobe/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: imageUri,
          name: marketplaceName.trim(),
          description: marketplaceDescription.trim(),
          price: price,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post to marketplace');
      }
      
      setLoading(false);
      Alert.alert('Success', 'Item posted to marketplace successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setMarketplaceModal(false);
            setMarketplaceName('');
            setMarketplaceDescription('');
            setMarketplacePrice('');
            router.push('/marketplace');
          }
        }
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to post to marketplace');
    }
  };

  const handleFinalSubmit = async (): Promise<void> => {
    if (!selectedCategory || selectedSubcategories.length === 0) {
      Alert.alert('Error', 'Please select both category and at least one subcategory');
      return;
    }

    if (!clothName.trim()) {
      Alert.alert('Error', 'Please enter a cloth name');
      return;
    }

    setLoading(true);
    try {
      if (!imageUri) throw new Error('No image found');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.7:3000/api/wardrobe/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: imageUri,
          clothName: clothName.trim(),
          description: description.trim(),
          categories: selectedSubcategories, // Save the subcategory types
          occasions,
          category: selectedCategory, // Save the main category
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item');
      }
      setLoading(false);
      Alert.alert('Success', 'Clothing item saved successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/wardrobe')
        }
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to save item');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E6D3" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GLAMORA SCAN</Text>
        <View style={styles.placeholder} />
      </View>
      {/* Image Display - always below header */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri as string }} style={styles.image} />
      </View>
      {loading && (
        <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Cloth name</Text>
            <TextInput
              style={styles.input}
              value={clothName}
              onChangeText={setClothName}
              placeholder="Enter cloth name"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddToWardrobe}>
              <Text style={styles.buttonText}>Add to Wardrobe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handlePostToMarketplace}>
              <Text style={styles.buttonText}>Post to Marketplace</Text>
            </TouchableOpacity>
          </View>
          
          {/* Show selected category info and save button */}
          {selectedCategory && selectedSubcategories.length > 0 && (
            <View style={styles.selectedCategoryContainer}>
              <Text style={styles.selectedCategoryText}>
                Selected: {selectedCategory} → {selectedSubcategories.map(sub => 
                  categoryData[selectedCategory as keyof typeof categoryData]?.find(s => s.type === sub)?.name
                ).join(', ')}
              </Text>
              {occasions.length > 0 && (
                <Text style={styles.selectedOccasionText}>
                  Occasions: {occasions.join(', ')}
                </Text>
              )}
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleFinalSubmit}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Item'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Category Selection Modal */}
      <Modal visible={wardrobeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setWardrobeModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsContainer}>
              {Object.keys(categoryData).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.optionItem}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.optionText}>{category}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Subcategory Selection Modal */}
      <Modal visible={subcategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCategory} - Select Types</Text>
              <TouchableOpacity onPress={() => setSubcategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsContainer}>
              {categoryData[selectedCategory as keyof typeof categoryData]?.map((subcategory) => (
                <TouchableOpacity
                  key={subcategory.type}
                  style={[
                    styles.optionItem,
                    selectedSubcategories.includes(subcategory.type) && styles.selectedOption
                  ]}
                  onPress={() => handleSubcategorySelect(subcategory)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedSubcategories.includes(subcategory.type) && styles.selectedOptionText
                  ]}>
                    {subcategory.name}
                  </Text>
                  {selectedSubcategories.includes(subcategory.type) && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={handleSubcategoryDone}>
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Occasion Selection Modal */}
      <Modal visible={occasionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Occasions</Text>
              <TouchableOpacity onPress={() => setOccasionModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsContainer}>
              {occasionOptions.map((occasion) => (
                <TouchableOpacity
                  key={occasion}
                  style={[
                    styles.optionItem,
                    occasions.includes(occasion) && styles.selectedOption
                  ]}
                  onPress={() => handleOccasionSelect(occasion)}
                >
                  <Text style={[
                    styles.optionText,
                    occasions.includes(occasion) && styles.selectedOptionText
                  ]}>
                    {occasion}
                  </Text>
                  {occasions.includes(occasion) && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={handleOccasionDone}>
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Marketplace Modal */}
      <Modal visible={marketplaceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post to Marketplace</Text>
              <TouchableOpacity onPress={() => setMarketplaceModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.marketplaceForm}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.marketplaceInput}
                value={marketplaceName}
                onChangeText={setMarketplaceName}
                placeholder="Enter item name"
                placeholderTextColor="#999"
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.marketplaceInput, styles.marketplaceTextarea]}
                value={marketplaceDescription}
                onChangeText={setMarketplaceDescription}
                placeholder="Enter description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.inputLabel}>Price (₱)</Text>
              <TextInput
                style={styles.marketplaceInput}
                value={marketplacePrice}
                onChangeText={setMarketplacePrice}
                placeholder="Enter price"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity 
              style={styles.marketplaceSubmitButton} 
              onPress={handleMarketplaceSubmit}
              disabled={loading}
            >
              <Text style={styles.marketplaceSubmitText}>
                {loading ? 'Posting...' : 'Post to Marketplace'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF1EC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#F5E6D3',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: '90%',
    height: 200,
    borderRadius: 10,
  },
  formContainer: {
    margin: 20,
    backgroundColor: '#FDE6D6',
    borderRadius: 16,
    padding: 16,
  },
  inputSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#333',
    fontSize: 16,
    padding: 4,
    color: '#333',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#FFE8C8',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  optionsContainer: {
    width: '100%',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOption: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  modalButton: {
    backgroundColor: '#FFE8C8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  modalButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  selectedCategoryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFE8C8',
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedOccasionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  marketplaceForm: {
    width: '100%',
    marginTop: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  marketplaceInput: {
    borderBottomWidth: 1,
    borderColor: '#333',
    fontSize: 16,
    padding: 4,
    color: '#333',
    marginBottom: 15,
  },
  marketplaceTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  marketplaceSubmitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  marketplaceSubmitText: {
    fontWeight: 'bold',
    color: '#fff',
  },
}); 