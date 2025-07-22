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
  const [categoryModal, setCategoryModal] = useState(false);
  const [wardrobe, setWardrobe] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const wardrobeOptions = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];
  const categoryOptions = ['T-shirt', 'Formals', 'Jackets/Sweatshirt', 'Shirt/Camisole', 'Casual', 'Sport'];
  const occasionOptions = ['Birthdays', 'Weddings', 'Work', 'Casual', 'Party', 'Sports'];

  const handleAddToWardrobe = (): void => {
    setWardrobeModal(true);
  };

  const handlePostToMarketplace = (): void => {
    setCategoryModal(true);
  };

  const handleWardrobeNext = (): void => {
    setWardrobeModal(false);
    setCategoryModal(true);
  };

  const handleFinalSubmit = async (): Promise<void> => {
    setCategoryModal(false);
    setLoading(true);
    try {
      if (!imageUri) throw new Error('No image found');
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.6:3000/api/wardrobe/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: imageUri,
          clothName,
          description,
          wardrobe,
          categories,
          occasions,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item');
      }
      setLoading(false);
      Alert.alert('Success', 'Clothing item saved!');
      router.back();
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
        </View>
      </ScrollView>
      {/* Wardrobe Selection Modal */}
      <Modal visible={wardrobeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Wardrobe Category</Text>
              <TouchableOpacity onPress={() => setWardrobeModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsContainer}>
              {wardrobeOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    wardrobe.includes(option) && styles.selectedOption
                  ]}
                  onPress={() => setWardrobe(w =>
                    w.includes(option)
                      ? w.filter(x => x !== option)
                      : [...w, option]
                  )}
                >
                  <Text style={[
                    styles.optionText,
                    wardrobe.includes(option) && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {wardrobe.includes(option) && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={handleWardrobeNext}>
              <Text style={styles.modalButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Category/Occasion Selection Modal */}
      <Modal visible={categoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categories & Occasions</Text>
              <TouchableOpacity onPress={() => setCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsContainer}>
              <Text style={styles.sectionHeader}>Categories</Text>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    categories.includes(option) && styles.selectedOption
                  ]}
                  onPress={() => setCategories(c =>
                    c.includes(option)
                      ? c.filter(x => x !== option)
                      : [...c, option]
                  )}
                >
                  <Text style={[
                    styles.optionText,
                    categories.includes(option) && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {categories.includes(option) && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
              <Text style={styles.sectionHeader}>Occasions</Text>
              {occasionOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    occasions.includes(option) && styles.selectedOption
                  ]}
                  onPress={() => setOccasions(o =>
                    o.includes(option)
                      ? o.filter(x => x !== option)
                      : [...o, option]
                  )}
                >
                  <Text style={[
                    styles.optionText,
                    occasions.includes(option) && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {occasions.includes(option) && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={handleFinalSubmit}>
              <Text style={styles.modalButtonText}>Save</Text>
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
}); 