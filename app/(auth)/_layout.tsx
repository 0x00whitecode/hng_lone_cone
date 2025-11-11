import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/(home)/index'} />
  }

  return <Stack screenOptions={{
          headerShown: false, // hides the header/title
        }} />
}