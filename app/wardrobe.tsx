import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Wardrobe() {
  const categories = [
    { name: 'Tops', icon: 'shirt' as const },
    { name: 'Bottoms', icon: 'body' as const },
    { name: 'Shoes', icon: 'football' as const },
    { name: 'Accessories', icon: 'bag' as const },
  ];

  const handleCategoryPress = (categoryName: string) => {
    switch (categoryName) {
      case 'Tops':
        router.push('/category');
        break;
      case 'Bottoms':
        router.push('/bottoms-category');
        break;
      case 'Shoes':
        router.push('/shoes-category');
        break;
      case 'Accessories':
        router.push('/accessories-category');
        break;
      default:
        router.push('/category');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>G</Text>
          </View>
          <Text style={styles.appName}>GLAMORA</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Wardrobe Background */}
        <View style={styles.wardrobeContainer}>
          <View style={styles.wardrobe}>
            {/* Wardrobe shelves */}
            <View style={styles.shelf} />
            <View style={styles.shelf} />
            <View style={styles.shelf} />
            <View style={styles.drawer} />
            <View style={styles.drawer} />
          </View>

          {/* Category Cards Overlay */}
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.name)}
              >
                <Ionicons name={category.icon} size={40} color="#333" />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="shirt" size={24} color="#333" />
          <Text style={[styles.navText, styles.activeText]}>Wardrobe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="camera" size={24} color="#666" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4C2C2',
  },
  header: {
    backgroundColor: '#F4C2C2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B4513',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    fontFamily: 'serif',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  wardrobeContainer: {
    width: '100%',
    height: '80%',
    position: 'relative',
  },
  wardrobe: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DEB887',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
    position: 'relative',
  },
  shelf: {
    height: 4,
    backgroundColor: '#8B4513',
    marginVertical: 20,
    marginHorizontal: 10,
  },
  drawer: {
    height: 60,
    backgroundColor: '#CD853F',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  categoriesGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  categoryCard: {
    width: '45%',
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: 35, // Add extra bottom padding for phone navigation
    justifyContent: 'space-around',
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
}); 