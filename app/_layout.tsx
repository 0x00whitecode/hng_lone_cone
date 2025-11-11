import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar, View } from 'react-native';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

function RootStack() {
  const { colors, statusBarStyle } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} />
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </ClerkProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
