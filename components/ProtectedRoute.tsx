import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  //const { user } = useContext(AuthContext);
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user === null) {
      router.replace('/auth/LoginScreen'); 
    }
  }, [user, loading]);

  if (loading || user === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  

  return <>{children}</>;
}
