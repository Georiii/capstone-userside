import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';

export default function AccessoriesCategory() {
  const params = useLocalSearchParams();
  const categoryType = params.type || 'Accessories';
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Subcategories for Accessories
  const subcategories = [
    { name: 'Bags', type: 'Bags', image: require('../assets/bags-sample.png') },
    { name: 'Jewelry', type: 'Jewelry', image: require('../assets/jewelry-sample.png') },
    { name: 'Belts', type: 'Belts', image: require('../assets/belts-sample.png') },
    { name: 'Scarves', type: 'Scarves', image: require('../assets/scarves-sample.png') },
    { name: 'Hats', type: 'Hats', image: require('../assets/hats-sample.png') },
    { name: 'Sunglasses', type: 'Sunglasses', image: require('../assets/sunglasses-sample.png') },
  ];

  const handleSubcategoryPress = (subcategory: { name: string, type: string }) => {
    router.push({ pathname: '/accessories-category', params: { type: subcategory.type } });
  };

  useEffect(() => {
    const fetchWardrobe = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.7:3000/api/wardrobe/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          // Filter items based on the selected category type
          const filteredItems = data.items.filter((item: any) => {
            // Check if the item's categories array includes the current category type
            return (item.categories || []).includes(categoryType);
          });
          setItems(filteredItems);
        } else {
          setItems([]);
        }
      } catch (err) {
        setItems([]);
      }
      setLoading(false);
    };
    fetchWardrobe();
  }, [categoryType]);

  const handleAddMore = () => {
    router.push('/scan');
  };

  // If on the main category page (not filtered), show subcategories
  if (!params.type || params.type === 'Accessories') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.gCircle}><Text style={styles.gText}>G</Text></View>
          <Text style={styles.headerText}>GLAMORA</Text>
        </View>
        <Text style={styles.categoryTitle}>CATEGORY</Text>
        <View style={styles.subcategoriesGrid}>
          {subcategories.map((sub, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.subcategoryCard}
              onPress={() => handleSubcategoryPress(sub)}
            >
              <Image source={sub.image} style={styles.subcategoryImage} />
              <Text style={styles.subcategoryLabel}>{sub.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Bottom Navigation (reuse from wardrobe) */}
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/wardrobe')}>
            <Ionicons name="shirt" size={24} color="#333" />
            <Text style={[styles.navText, styles.activeText]}>Wardrobe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/scan')}>
            <Ionicons name="camera" size={24} color="#666" />
            <Text style={styles.navText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/marketplace')}>
            <Ionicons name="cart" size={24} color="#666" />
            <Text style={styles.navText}>Market</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person" size={24} color="#666" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 20, top: 55, zIndex: 2 }}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.categoryTitle}>{categoryType}</Text>
        <TouchableOpacity style={{ position: 'absolute', right: 20, top: 55, zIndex: 2 }}>
          <Ionicons name="trash" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#8B4513" style={{ marginTop: 30 }} />
        ) : (
          <>
            <View style={styles.row}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item._id || index}
                  style={styles.itemCard}
                  onPress={() => router.push({
                    pathname: '/item-detail',
                    params: {
                      itemId: item._id,
                      imageUrl: item.imageUrl,
                      clothName: item.clothName,
                      description: item.description,
                      occasion: (item.occasions && item.occasions[0]) || '',
                      category: categoryType,
                    }
                  })}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  <Text style={styles.itemLabel}>{item.clothName || 'Cloth name'}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addMoreCard} onPress={handleAddMore}>
                <Ionicons name="add" size={32} color="#000" />
                <Text style={styles.addMoreLabel}>Add more</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F3F0',
    paddingBottom: 90, // Add extra space for the fixed footer
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#F9F3F0',
    justifyContent: 'flex-start',
  },
  gCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4B2E2B',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B2E2B',
    fontFamily: 'serif',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B2E2B',
    fontFamily: 'serif',
    letterSpacing: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 24,
    marginTop: 10,
    marginBottom: 18,
  },
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  subcategoryCard: {
    width: 90,
    alignItems: 'center',
    margin: 12,
  },
  subcategoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#222',
    marginBottom: 8,
    resizeMode: 'cover',
  },
  subcategoryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#F5F2EF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  activeText: {
    color: '#333',
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'flex-start',
  },
  itemCard: {
    width: '44%',
    margin: '3%',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
    resizeMode: 'cover',
  },
  itemLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginBottom: 4,
  },
  addMoreCard: {
    width: '44%',
    margin: '3%',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    height: 180,
    borderWidth: 1,
    borderColor: '#222',
    borderStyle: 'dashed',
  },
  addMoreLabel: {
    fontSize: 15,
    color: '#222',
    marginTop: 8,
  },
  logoIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
}); 