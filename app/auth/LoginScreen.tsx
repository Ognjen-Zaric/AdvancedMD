import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { auth, db } from '../../firebase/config';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docSnap = await getDoc(doc(db, 'users', user.uid));

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          uid: user.uid,
          email: user.email!,
          username: data.username,
        });

        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', 'User profile not found');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#f5f5f5' },
      ]}
    >
      <Text style={[styles.appTitle, { color: isDark ? '#fff' : '#000' }]}>
        Welcome back!
      </Text>

      <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Login</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
        />
        <View style={styles.buttonWrapper}>
          <Button title="Login" onPress={handleLogin} />
        </View>
        <Text
          style={[styles.registerText, { color: isDark ? '#61dafb' : 'blue' }]}
          onPress={() => router.push('./RegisterScreen')}
        >
          Don't have an account? Register
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  buttonWrapper: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  registerText: {
    marginTop: 15,
    textAlign: 'center',
  },
});

export default LoginScreen;
