import { Redirect } from 'expo-router';

export default function DeprecatedHomeRedirect() {
  return <Redirect href="/(home)/index" />;
}

