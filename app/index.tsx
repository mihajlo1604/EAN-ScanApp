import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Button, FlatList, PermissionsAndroid, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

interface Item {
  id: string;
  text: string;
}

export default function ScanningScreen() {
  const [text, setText] = useState('');
  const [items, setItems] = useState<Item[]>([]);

  const handleAdd = () => {
    if (text.trim()) {
      setItems([...items, { id: Date.now().toString(), text }]);
      setText('');
    }
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Debug helper that runs export immediately and reports progress via alerts.
  const directExport = async () => {
    Alert.alert('Debug', 'directExport started');
    try {
      const data = items.map(item => ({ Text: item.text }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Items');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      if (Platform.OS === 'android') {
        // Check current permission state first
        const hasBefore = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        Alert.alert('Debug', `Permission before request: ${hasBefore}`);

        Alert.alert('Debug', 'Requesting WRITE_EXTERNAL_STORAGE permission');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage permission required',
            message: 'This app needs access to your storage to save the Excel file to Downloads.',
            buttonPositive: 'OK',
          }
        );
        Alert.alert('Debug', `Permission result: ${granted}`);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const downloadsDir = '/storage/emulated/0/Download';
          const fileName = `items_${Date.now()}.xlsx`;
          const fileUri = `file://${downloadsDir}/${fileName}`;

          try {
            await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
            const info = await FileSystem.getInfoAsync(fileUri);
            Alert.alert('Debug', `Write success: ${fileUri}\nInfo: ${JSON.stringify(info)}`);
            console.log('Write info:', info);

            // List Downloads directory to help debugging
            try {
              const files = await FileSystem.readDirectoryAsync(downloadsDir);
              Alert.alert('Debug', `Downloads contains: ${files.slice(0, 10).join(', ')}`);
              console.log('Downloads listing:', files);
            } catch (dirErr) {
              console.warn('Could not list Downloads directory:', dirErr);
              Alert.alert('Debug', `Could not list Downloads: ${String(dirErr)}`);
            }

            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri);
            } else {
              Alert.alert('Saved', `Excel file saved to Downloads: ${fileUri}`);
            }
          } catch (writeErr) {
            Alert.alert('Error writing to Downloads', String(writeErr));
            console.error('Write to Downloads error:', writeErr);

            // Fallback: try saving to documentDirectory and report
            try {
              const fallbackUri = (FileSystem as any).documentDirectory + `items_${Date.now()}.xlsx`;
              await FileSystem.writeAsStringAsync(fallbackUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
              const fbInfo = await FileSystem.getInfoAsync(fallbackUri);
              Alert.alert('Debug', `Fallback write success: ${fallbackUri}\nInfo: ${JSON.stringify(fbInfo)}`);
              console.log('Fallback write info:', fbInfo);
            } catch (fbErr) {
              Alert.alert('Fallback write error', String(fbErr));
              console.error('Fallback write error:', fbErr);
            }
          }
        } else {
          Alert.alert('Permission denied', 'Cannot save file without permission to write to external storage.');
        }
      } else {
        Alert.alert('Debug', 'Saving to documentDirectory');
        const uri = (FileSystem as any).documentDirectory + `items_${Date.now()}.xlsx`;
        try {
          await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
          const info = await FileSystem.getInfoAsync(uri);
          Alert.alert('Debug', `Write success: ${uri}\nInfo: ${JSON.stringify(info)}`);
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            Alert.alert('Saved', `Excel file saved to ${uri}`);
          }
        } catch (err) {
          Alert.alert('Error saving to documentDirectory', String(err));
          console.error('DocumentDirectory write error:', err);
        }
      }
    } catch (error) {
      Alert.alert('Error saving file', String(error));
      console.error('Export error:', error);
    }
  };

  const handleExport = async () => {
    Alert.alert(
      'Security Warning',
      'The library used for Excel export (xlsx) has a known high-severity vulnerability. Proceed with caution.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Proceed',
          onPress: async () => {
            Alert.alert('Debug', 'Proceed pressed — starting export');
            await directExport();
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Scanning</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Enter text here"
        onChangeText={newText => setText(newText)}
        value={text}
        onSubmitEditing={handleAdd}
      />
      <Button
        title="Add"
        onPress={handleAdd}
      />
      <View style={{ marginTop: 20 }}>
        <Button
          title="Export to Excel"
          onPress={handleExport}
        />
        <View style={{ marginTop: 8 }}>
          <Button
            title="Export to Excel (no confirm)"
            onPress={directExport}
          />
        </View>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.text}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    padding: 10,
    marginVertical: 20,
    color: 'black'
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  itemText: {
    color: 'black',
    flex: 1,
  },
});
