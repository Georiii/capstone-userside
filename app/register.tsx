import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
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

    try {
      Alert.alert('Creating account...'); // Debug alert
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Account created successfully!'); // Debug alert
      router.push('/login');
    } catch (error: any) {
      Alert.alert('Registration error: ' + error.message); // Debug alert
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.header}>Create an account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="white"
        value={email}
        onChangeText={setEmail}
      />
      <View style={{ width: 270, flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
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
      <View style={{ width: 270, flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
        <TextInput
          style={[styles.input, { flex: 1, marginTop: 0 }]}
          placeholder="Confirm Password"
          placeholderTextColor="white"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)} style={{ position: 'absolute', right: 10 }}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign up</Text>
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
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    position: 'absolute',
    top: 50,
    right: 15,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 0,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: 270,
    height: 50,
    borderRadius: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 12,
    color: 'black',
  },
  signUpButton: {
    width: 150,
    height: 40,
    backgroundColor: '#FFE8C8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    alignSelf: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
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
    fontSize: 13,
  },
  loginText: {
    color: '#F88379',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
