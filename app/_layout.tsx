import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { AuthProvider } from '@/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <LocationProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LocationProvider>
    </AuthProvider>
  );
}
