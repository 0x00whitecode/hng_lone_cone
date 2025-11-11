import { SignUp } from '@clerk/clerk-expo';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>
        Join HNGCoin and start managing your crypto securely
      </Text>

      <View style={styles.signUpWrapper}>
        <SignUp
          afterSignUpUrl="/(home)/index"
          routing="path"
          path="/(auth)/sign-up"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00FFD1',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  signUpWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});
