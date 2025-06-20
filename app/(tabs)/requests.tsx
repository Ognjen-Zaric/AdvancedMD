import { useRouter } from 'expo-router';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from 'react-native';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

export default function FriendRequests() {
  const { user } = useAuth();
  const router = useRouter();
  const [incoming, setIncoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchIncomingRequests = async () => {
    if (!user) return;

    const currentUserRef = doc(db, 'users', user.uid);
    const currentUserSnap = await getDoc(currentUserRef);
    const incomingUIDs = currentUserSnap.data()?.friendRequests?.incoming || [];

    if (incomingUIDs.length === 0) {
      setIncoming([]);
      return;
    }

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const incomingUsers = snapshot.docs
      .filter(doc => incomingUIDs.includes(doc.id))
      .map(doc => ({ id: doc.id, ...doc.data() }));

    setIncoming(incomingUsers);
  };

  useEffect(() => {
    fetchIncomingRequests();
  }, [user]);

  const handleAccept = async (uid: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const currentUserRef = doc(db, 'users', user.uid);
      const targetUserRef = doc(db, 'users', uid);

      await updateDoc(currentUserRef, {
        'friendRequests.incoming': arrayRemove(uid),
        friends: arrayUnion(uid),
      });

      await updateDoc(targetUserRef, {
        'friendRequests.outgoing': arrayRemove(user.uid),
        friends: arrayUnion(user.uid),
      });

      Alert.alert('Success', 'Friend request accepted');
      fetchIncomingRequests();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (uid: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const currentUserRef = doc(db, 'users', user.uid);
      const targetUserRef = doc(db, 'users', uid);

      await updateDoc(currentUserRef, {
        'friendRequests.incoming': arrayRemove(uid),
      });

      await updateDoc(targetUserRef, {
        'friendRequests.outgoing': arrayRemove(user.uid),
      });

      Alert.alert('Request rejected');
      fetchIncomingRequests();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#f5f5f5' },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        Friend Requests
      </Text>
      {incoming.length > 0 ? (
        incoming.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                borderColor: isDark ? '#444' : '#ccc',
              },
            ]}
          >
            <Text style={[styles.username, { color: isDark ? '#fff' : '#000' }]}>
              {item.username}
            </Text>
            <View style={styles.actions}>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Accept"
                  onPress={() => handleAccept(item.id)}
                  disabled={loading}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Reject"
                  onPress={() => handleReject(item.id)}
                  disabled={loading}
                  color="red"
                />
              </View>
            </View>
          </View>
        ))
      ) : (
        <Text style={{ color: isDark ? '#ccc' : '#666', textAlign: 'center' }}>
          No incoming requests
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  username: {
    fontSize: 18,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
