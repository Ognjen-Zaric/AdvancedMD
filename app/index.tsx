import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../AuthContext';


export default function Index() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/auth/LoginScreen');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
