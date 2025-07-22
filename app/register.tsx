import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Remove Firebase imports and usage. Refactor registration to use your backend API.

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    if (!/@(gmail|yahoo|outlook)\.com$/.test(email)) {
      Alert.alert('Email must be a valid Gmail, Yahoo, or Outlook address.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      // Use your backend registration endpoint
      const response = await fetch('http://192.168.1.6:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      Alert.alert('Account created successfully!');
      router.push({ pathname: '/login', params: { fromRegister: 'true' } });
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration error: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo and Brand */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.brandText}>GLAMORA</Text>
      </View>

      <Text style={styles.header}>Create an account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="rgba(255, 255, 255, 0.8)"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="rgba(255, 255, 255, 0.8)"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="rgba(255, 255, 255, 0.8)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          placeholderTextColor="rgba(255, 255, 255, 0.8)"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          onPress={() => setShowPassword((prev) => !prev)} 
          style={styles.eyeIcon}
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Confirm Password"
          placeholderTextColor="rgba(255, 255, 255, 0.8)"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity 
          onPress={() => setShowConfirmPassword((prev) => !prev)} 
          style={styles.eyeIcon}
        >
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.signUpButtonText}>{loading ? 'Signing up...' : 'Sign up'}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Login</Text>
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

  logoContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'center',
  },

  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  brandText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },

  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  input: {
    width: 280,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 15,
    color: 'white',
    fontSize: 16,
  },

  passwordContainer: {
    width: 280,
    position: 'relative',
    marginBottom: 15,
  },

  passwordInput: {
    marginBottom: 0,
  },

  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 14,
  },

  signUpButton: {
    width: 160,
    height: 45,
    backgroundColor: '#FFE8C8',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    alignSelf: 'center',
  },

  signUpButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
  },

  footerText: {
    color: 'white',
    fontSize: 14,
  },

  loginText: {
    color: '#F88379',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});
