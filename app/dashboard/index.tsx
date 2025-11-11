import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { SignOutButton } from '@/app/components/SignOutButton';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <SignedIn>
        <Text style={styles.welcome}>Welcome, {user?.fullName || 'User'}!</Text>
        <SignOutButton />
      </SignedIn>

      <SignedOut>
        <Text>You must be signed in to view this page.</Text>
        <Link href="/(auth)/sign-in">
          <Text style={styles.link}>Go to Sign In</Text>
        </Link>
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  welcome: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  link: { color: 'blue', marginTop: 10 },
});
