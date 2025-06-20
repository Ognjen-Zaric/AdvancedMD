import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocation } from '@/context/LocationContext';
import { auth, db } from '@/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function HomeScreen() {
  return (
    <ProtectedRoute>
      <ActualHomeScreenContent />
    </ProtectedRoute>
  );
}

function ActualHomeScreenContent() {
  const [username, setUsername] = useState<string | null>(null);
  const [deviceLocation, setDeviceLocation] = useState<Location.LocationObject | null>(null);
  const { selectedLocation, setSelectedLocation } = useLocation();
  const { user, setUser } = useAuth();
  const [sharedLocations, setSharedLocations] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setDeviceLocation(loc);
      setSelectedLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setUsername(docSnap.data().username);
        }
      } catch (err) {
        console.error('Error fetching username:', err);
      }
    };

    fetchUserData();
  }, [user]);

  const fetchReceivedLocations = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'locationShares'), where('to', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const senderSnap = await getDoc(doc(db, 'users', data.from));
        const senderName = senderSnap.exists() ? senderSnap.data().username : 'Unknown';
        return {
          id: docSnap.id,
          ...data,
          sender: senderName,
        };
      }));
      setSharedLocations(data);
    } catch (err) {
      console.error('Error fetching shared locations:', err);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchReceivedLocations();
    }, [fetchReceivedLocations])
  );

  const handleNavigate = (lat: number, lng: number) => {
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${lat},${lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleFocusOnMap = (lat: number, lng: number) => {
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleDiscard = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'locationShares', id));
      fetchReceivedLocations();
    } catch (err) {
      console.error('Error deleting shared location:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const q = query(collection(db, 'locationShares'), where('to', '==', user.uid));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
      fetchReceivedLocations();
    } catch (err) {
      console.error('Error clearing shared locations:', err);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    router.replace('/auth/LoginScreen');
  };

  const formatTimestamp = (ts: any) => {
    if (!ts?.seconds) return 'Unknown time';
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff',
          flexGrow: 1,
        },
      ]}
    >
      <ThemedView style={styles.titleContainer}>
        <View style={styles.titleTextWrapper}>
          <ThemedText type="title" style={{ fontSize: 24, fontWeight: 'bold' }}>
            {username ? `Hello, ${username}!` : 'Hello!'}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: deviceLocation?.coords.latitude ?? 37.78825,
            longitude: deviceLocation?.coords.longitude ?? -122.4324,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Current Location"
              pinColor="green"
            />
          )}
          {sharedLocations.map((loc, idx) => (
            <Marker
              key={idx}
              coordinate={loc.coordinates}
              title={`Shared by ${loc.sender}`}
              pinColor="orange"
            />
          ))}
        </MapView>
      </ThemedView>

      {sharedLocations.length === 0 ? (
        <ThemedText
          style={{
            textAlign: 'center',
            marginTop: 30,
            color: colorScheme === 'dark' ? '#aaa' : '#555',
            marginBottom: 50,
          }}
        >
          No shared locations yet. Once a friend shares a location with you, it will show up here!
        </ThemedText>
      ) : (
        <>
          {sharedLocations.map((item) => (
            <View
              key={item.id}
              style={[
                styles.sharedCard,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                  borderColor: '#000',
                  borderWidth: 1,
                },
              ]}
            >
              <ThemedText>{`From: ${item.sender}`}</ThemedText>
              <ThemedText>{`Time: ${formatTimestamp(item.timestamp)}`}</ThemedText>
              <View style={styles.sharedButtons}>
                <View style={styles.roundButton}>
                  <Button title="Navigate" onPress={() => handleNavigate(item.coordinates.latitude, item.coordinates.longitude)} />
                </View>
                <View style={styles.roundButton}>
                  <Button title="Map view" onPress={() => handleFocusOnMap(item.coordinates.latitude, item.coordinates.longitude)} />
                </View>
                <View style={styles.roundButton}>
                  <Button title="Discard" onPress={() => handleDiscard(item.id)} color="red" />
                </View>
              </View>
            </View>
          ))}

          <View style={[styles.roundButton, { marginTop: 10 }]}>
            <Button title="Clear All Shared Locations" onPress={handleClearAll} color="red" />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  titleTextWrapper: {
    paddingBottom: 4,
  },
  mapContainer: {
    height: 450,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 2,
  },
  sharedCard: {
    marginTop: 15,
    padding: 12,
    borderRadius: 12,
  },
  sharedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  roundButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 2,
  },
});
