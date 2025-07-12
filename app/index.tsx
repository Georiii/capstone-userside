import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

export default function Home() {
  const [fontsLoaded] = useFonts({
    'PlayfairDisplay-Medium': require('../assets/fonts/PlayfairDisplay-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C71585" />
        <Text style={styles.loadingText}>Loading Glamora...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.text}>Welcome to Glamora</Text>
      <Text style={styles.subtext}>Choose your outfit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4C2C2',
    alignItems: 'center',
    paddingTop: 40, 
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 30,
  },

  text: {
    fontSize: 36,
    color: '#333',
    fontFamily: 'PlayfairDisplay-Medium',
    textAlign: 'center',
    marginBottom: 5, // space between title and subtitle
  },

  subtext: {
    fontSize: 20,
    color: '#555',
    fontFamily: 'PlayfairDisplay-Medium',
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4C2C2',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#C71585',
  },
});
