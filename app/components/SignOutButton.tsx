import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return <Button title="Sign Out" onPress={handleSignOut} style={styles.button} />;
}

  const styles = StyleSheet.create({
    button: {
      marginBottom:20
    },
  });