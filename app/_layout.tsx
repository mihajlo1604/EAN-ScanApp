import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { MenuProvider } from 'react-native-popup-menu';
import ThreeDotMenu from '@/components/three-dot-menu';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <MenuProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'Scanning',
              headerRight: () => <ThreeDotMenu />,
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </MenuProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
