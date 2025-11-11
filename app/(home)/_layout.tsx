import { useAuth } from '@clerk/clerk-expo';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import CustomTabBar from '../components/CustomTabBar';

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  // Wait for auth state to load
  if (!isLoaded || !isSignedIn) {
    return null; // or a splash screen
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',  // Make it float on top
          top: 0,                // Place it at the top of the screen
          left: 0,
          right: 0,
          zIndex: 9999,          // Ensure it's above other content
          elevation: 10,         // Android shadow/elevation
          backgroundColor: 'rgba(0, 0, 0, 1)', // semi-transparent or solid background
          height: 70,
          borderTopWidth: 0,
          borderBottomWidth: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="charts" options={{ title: 'Charts' }} />
      <Tabs.Screen name="transfer" options={{ title: 'Transfer' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
