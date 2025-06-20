import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: username,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Account created!');
      router.replace('/auth/LoginScreen');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
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
        Welcome to PickMeUp!
      </Text>

      <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Register</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          value={username}
          onChangeText={setUsername}
          style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
          autoCapitalize="none"
        />
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
          <Button title="Register" onPress={handleRegister} />
        </View>
        <Text
          style={[styles.loginText, { color: isDark ? '#61dafb' : 'blue' }]}
          onPress={() => router.push('/auth/LoginScreen')}
        >
          Already have an account? Login
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
  loginText: {
    marginTop: 15,
    textAlign: 'center',
  },
});

export default RegisterScreen;
