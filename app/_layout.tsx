import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Alert, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Scanning',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Load new DB',
                    'Loading database functionality will be implemented here.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Ionicons name="ellipsis-vertical" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
