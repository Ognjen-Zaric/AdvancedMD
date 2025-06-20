import { useRouter } from 'expo-router';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const SearchFriends = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const handleSearch = async () => {
    if (!searchTerm) return;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', searchTerm));
      const querySnapshot = await getDocs(q);

      const foundUsers: any[] = [];
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id !== user?.uid) {
          foundUsers.push({ id: docSnap.id, ...docSnap.data() });
        }
      });

      setResults(foundUsers);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  const handleSendRequest = async (targetUid: string, targetUsername: string) => {
    if (!user) return;

    try {
      const currentUserRef = doc(db, 'users', user.uid);
      await updateDoc(currentUserRef, {
        'friendRequests.outgoing': arrayUnion(targetUid),
      });

      const targetUserRef = doc(db, 'users', targetUid);
      await updateDoc(targetUserRef, {
        'friendRequests.incoming': arrayUnion(user.uid),
      });

      Alert.alert('Friend request sent to', targetUsername);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <FlatList
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#f5f5f5' },
      ]}
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.resultCard,
            {
              backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
              borderColor: isDark ? '#444' : '#ccc',
            },
          ]}
          onPress={() => handleSendRequest(item.id, item.username)}
        >
          <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 16, fontWeight: 'bold' }}>
            {item.username}
          </Text>
          <Text style={{ color: isDark ? '#aaa' : '#555', fontSize: 12 }}>
            {item.email}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', color: isDark ? '#888' : '#666' }}>
          No results found
        </Text>
      }
      ListHeaderComponent={
        <>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Search Friends
          </Text>
          <TextInput
            placeholder="Enter username"
            placeholderTextColor={isDark ? '#aaa' : '#666'}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#444' : '#ccc',
              },
            ]}
            autoCapitalize="none"
          />
          <View style={styles.buttonWrapper}>
            <Button title="Search" onPress={handleSearch} />
          </View>
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonWrapper: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  resultCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1.5,
  },
});

export default SearchFriends;
