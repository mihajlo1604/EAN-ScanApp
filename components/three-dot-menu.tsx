import React from 'react';
import { Alert, Text, View } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from '@react-native-menu/menu';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ThreeDotMenu() {
  const colorScheme = useColorScheme();

  const handleLoadNewDB = () => {
    Alert.alert(
      'Load new DB',
      'Loading database functionality will be implemented here.',
      [{ text: 'OK' }]
    );
  };

  return (
    <Menu>
      <MenuTrigger>
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={colorScheme === 'dark' ? 'white' : 'black'}
        />
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={handleLoadNewDB}>
          <Text>Load new DB</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
}

