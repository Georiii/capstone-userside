import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <Text style={styles.text}>Login to your{"\n"}Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="white"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="white"
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account? </Text>
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
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginLeft: 'auto',
    marginRight: 10,
    marginTop: 20,
  },

  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 60,
    marginLeft: 10,
    lineHeight: 35,
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
    marginLeft: 25,
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
    marginTop: 20,
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
    marginLeft: 110,
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
