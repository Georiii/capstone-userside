import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Remove Firebase imports and usage. Refactor login to use your backend API.

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Remove Firebase onAuthStateChanged usage.
    setCheckingAuth(false);
  }, [params]);

  if (checkingAuth) {
    return null; // or a loading spinner if you prefer
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    if (email.includes('@') && !(/@(gmail|yahoo|outlook)\.com$/.test(email))) {
      Alert.alert('Email must be a valid Gmail, Yahoo, or Outlook address.');
      return;
    }
    try {
      const response = await fetch('http://192.168.1.12:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Login successful!');
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify({ name: data.user.name, email: data.user.email }));
        router.push('/wardrobe');
      } else {
        Alert.alert(data.message || 'Login failed.');
      }
    } catch (error: any) {
      Alert.alert(error.message || 'Login failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <Text style={styles.text}>Login to your{"\n"}Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="white"
        value={email}
        onChangeText={setEmail}
      />

      <View style={{ width: 270, flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
        <TextInput
          style={[styles.input, { flex: 1, marginTop: 0 }]}
          placeholder="Password"
          placeholderTextColor="white"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: 10 }}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/forgotpass')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.signUpText}>Sign up.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4C2C2',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    position: 'absolute',
    top: 40,
    right: 10,
  },

  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 0,
    marginBottom: 20,
    lineHeight: 35,
    textAlign: 'center',
  },

  input: {
    width: 270,
    height: 50,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 15,
    color: 'black',
  },

  loginButton: {
    width: 150,
    height: 40,
    backgroundColor: '#FFE8C8',
    borderRadius: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },

  forgotPassword: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },

  footerText: {
    color: 'white',
    fontSize: 13,
  },

  signUpText: {
    color: '#F88379',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
