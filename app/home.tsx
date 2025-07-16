import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        router.push('/login');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Glamora!</Text>
      <Text style={styles.email}>{user.email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4C2C2',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FFE8C8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  logoutText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loading: {
    fontSize: 18,
    color: 'white',
  },
}); 