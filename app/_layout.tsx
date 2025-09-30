// app/_layout.tsx
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Remove the old anchor; it's only for grouped routes like (tabs)
// export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        {/* If you still want a separate modal later, add:
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
