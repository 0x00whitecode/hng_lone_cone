import { useOAuth } from '@clerk/clerk-expo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const Index = () => {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

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

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = makeRedirectUri({ scheme: 'hng_lone_cone' });
      const { createdSessionId, setActive } = await startOAuthFlow({ redirectUrl });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        // Navigate to home after login
        router.push('/(home)/index');
      }
    } catch (err) {
      console.error('Google Sign-In Error', err);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/spirel1.png')}
        style={[styles.visual, { transform: [{ rotate }] }]}
        resizeMode="contain"
      />

      <Text style={styles.title}>HNGCoin</Text>
      <Text style={styles.subtitle}>Your personal crypto wallet</Text>
      <Text style={styles.description}>
        It's secure and supports nearly 100 cryptocurrencies
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
         <AntDesign name="google" size={24} color="black" />
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
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
    gap:10
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
  },
});
