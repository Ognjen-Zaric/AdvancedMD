import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocation } from '@/context/LocationContext';
import { db } from '@/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import {
  addDoc,
  arrayRemove,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FriendsList() {
  const { user } = useAuth();
  const { selectedLocation } = useLocation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<any[]>([]);

  const fetchFriends = async () => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const friendUIDs = userSnap.data()?.friends || [];

    if (friendUIDs.length === 0) {
      setFriends([]);
      return;
    }

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const friendUsers = snapshot.docs
      .filter(doc => friendUIDs.includes(doc.id))
      .map(doc => ({ id: doc.id, ...doc.data() }));

    setFriends(friendUsers);
  };

  const handleUnfriend = async (targetUid: string) => {
    if (!user) return;

    try {
      const currentUserRef = doc(db, 'users', user.uid);
      const targetUserRef = doc(db, 'users', targetUid);

      await updateDoc(currentUserRef, {
        friends: arrayRemove(targetUid),
      });

      await updateDoc(targetUserRef, {
        friends: arrayRemove(user.uid),
      });

      Alert.alert('Unfriended', `You have unfriended ${targetUid}.`);
      fetchFriends();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  const sendLocation = async (toUid: string) => {
    if (!user) return;
    if (!selectedLocation) {
      Alert.alert(
        'No location',
        'Your current location is not available. Go to the Home screen to refresh it.'
      );
      return;
    }

    try {
      await addDoc(collection(db, 'locationShares'), {
        from: user.uid,
        to: toUid,
        coordinates: selectedLocation,
        timestamp: serverTimestamp(),
      });

      Alert.alert('Success', 'Location shared with your friend!');
    } catch (err) {
      console.error('Error sharing location:', err);
      Alert.alert('Error', 'Failed to share location.');
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <ThemedText type="title" style={styles.title}>
        My Friends
      </ThemedText>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <ThemedView style={styles.card}>
            <ThemedText style={styles.username}>{item.username}</ThemedText>
            <ThemedText style={styles.email}>{item.email}</ThemedText>
            <View style={styles.buttonRow}>
              <View style={styles.buttonWrapper}>
                <Button title="Send Location" onPress={() => sendLocation(item.id)} />
              </View>
              <View style={styles.buttonWrapper}>
                <Button title="Unfriend" color="#cc0000" onPress={() => handleUnfriend(item.id)} />
              </View>
            </View>
          </ThemedView>
        )}
        ListEmptyComponent={<ThemedText>You have no friends yet.</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  title: {
    fontSize: 24,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  username: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  email: { color: 'gray', marginBottom: 10 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
