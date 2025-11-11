import { useAuth } from '@clerk/clerk-expo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Index = () => {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { isSignedIn } = useAuth(); // Clerk hook to check sign-in status

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/home'); // navigate to home (alias redirects to /(home)/index)
    }
  }, [isSignedIn]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
        />
      
      <Animated.Image
        source={require('../assets/spirel.png')}
        style={[styles.visual, { transform: [{ rotate }] }]}
        resizeMode="contain"
      />

      <Text style={styles.title}>HNGCoin</Text>
      <Text style={styles.subtitle}>Your personal crypto wallet</Text>
      <Text style={styles.description}>
        It's secure and supports nearly 100 cryptocurrencies
      </Text>

      {!isSignedIn && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <MaterialIcons name="navigate-next" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visual: {
    width: 400,
    height: 400,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00FFD1',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#00FFD1',
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
