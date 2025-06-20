
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext } from 'react';

import { LocationProvider } from '@/context/LocationContext';
import { AuthContext, AuthProvider } from '../AuthContext';
import HomeScreen from './(tabs)/home';
import LoginScreen from './auth/LoginScreen';
import RegisterScreen from './auth/RegisterScreen';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <>
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
 return (
    <AuthProvider>
      <LocationProvider>
        <NavigationContainer>
          <AppStack />
        </NavigationContainer>
      </LocationProvider>
    </AuthProvider>
  );
}

