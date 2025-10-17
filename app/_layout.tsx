import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { FavoritesProvider } from '@/contexts/favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <FavoritesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name='(tabs)'
            options={{ headerShown: false, title: 'Browse' }}
          />
          <Stack.Screen name='meal/[id]' options={{ title: 'Meal Details' }} />
        </Stack>
        <StatusBar style='auto' />
      </ThemeProvider>
    </FavoritesProvider>
  );
}
