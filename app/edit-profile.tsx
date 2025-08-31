import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState('Name');
  const [email, setEmail] = useState('Email');
  const [role, setRole] = useState('User');
  const [profileImage, setProfileImage] = useState('https://randomuser.me/api/portraits/men/1.jpg');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name || 'Name');
        setEmail(user.email || 'Email');
        setRole(user.role || 'User');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, name: name.trim(), email: email.trim() };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      </View>

      {/* Profile Form */}
      <View style={styles.formContainer}>
        {/* Name Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Email Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Role Field */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Role</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  roleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
});
