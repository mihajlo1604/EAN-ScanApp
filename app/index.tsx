import { useState } from 'react';
import { StyleSheet, TextInput, Button, View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
            const data = items.map(item => ({ Text: item.text }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Items");
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const uri = (FileSystem as any).cacheDirectory + 'items.xlsx';
            await FileSystem.writeAsStringAsync(uri, wbout, {
              encoding: 'base64'
            });

            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri);
            } else {
              Alert.alert('Sharing not available', 'Sharing is not available on this device.');
            }
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
