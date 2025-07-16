import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BottomsCategory() {
  const bottomTypes = [
    { name: 'Jeans', icon: 'shirt' as const },
    { name: 'Trousers', icon: 'shirt' as const },
    { name: 'Shorts', icon: 'shirt' as const },
    { name: 'Skirts', icon: 'shirt' as const },
    { name: 'Leggings', icon: 'shirt' as const },
    { name: 'Joggers', icon: 'shirt' as const },
  ];

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
        <Text style={styles.categoryTitle}>BOTTOMS</Text>
        
        <ScrollView contentContainerStyle={styles.categoriesContainer}>
          {bottomTypes.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
            >
              <View style={styles.categoryImage}>
                <Ionicons name={item.icon} size={50} color="#333" />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/wardrobe')}>
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
    backgroundColor: '#FEFEFE',
    paddingHorizontal: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  categoryItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 30,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: 35,
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