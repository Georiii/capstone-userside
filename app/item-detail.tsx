import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ItemDetail() {
  const params = useLocalSearchParams();
  const { imageUrl, clothName, description, occasion, category, itemId } = params;
  const imageSrc = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.1.6:3000/api/wardrobe/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        alert('Item deleted!');
        router.replace('/wardrobe');
      } else {
        alert('Failed to delete item.');
      }
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{category || 'Item'}</Text>
        <TouchableOpacity onPress={() => setShowConfirm(true)}>
          <Ionicons name="trash" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      {/* Image */}
      <Image source={{ uri: imageSrc }} style={styles.image} />

      {/* Details */}
      <Text style={styles.clothName}>{clothName}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.occasionContainer}>
        <Text style={styles.occasionLabel}>Occation</Text>
        <View style={styles.occasionPill}>
          <Text style={styles.occasionText}>{occasion}</Text>
        </View>
      </View>

      {/* Post to Marketplace Button */}
      <TouchableOpacity style={styles.marketButton}>
        <Text style={styles.marketButtonText}>Post to Marketplace</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Item?</Text>
            <Text style={styles.modalText}>Are you sure you want to delete this item? This action cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F3F0', padding: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, marginTop: 10,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#222' },
  image: {
    width: '100%', height: 250, borderRadius: 12, marginBottom: 18, marginTop: 10,
    borderWidth: 2, borderColor: '#222', backgroundColor: '#fff',
  },
  clothName: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  description: { fontSize: 16, color: '#222', marginBottom: 18 },
  occasionContainer: { marginBottom: 24 },
  occasionLabel: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  occasionPill: {
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#222',
    paddingHorizontal: 16, paddingVertical: 6, alignSelf: 'flex-start',
  },
  occasionText: { fontSize: 15, color: '#222' },
  marketButton: {
    backgroundColor: '#FFE0B2', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24,
    alignSelf: 'flex-end', marginTop: 20,
  },
  marketButtonText: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginBottom: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#F9F3F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  cancelButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 