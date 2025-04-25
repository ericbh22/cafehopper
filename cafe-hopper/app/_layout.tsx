import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { CafesProvider } from './context/cafes';
import { UserProvider } from './context/user';

function RootLayoutNav() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <UserProvider>
        <CafesProvider>
        <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      {/* You can still override specific screens like this if needed */}
      {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
    </Stack>
        </CafesProvider>
    </UserProvider>
);
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <CafesProvider>
          <RootLayoutNav />
        </CafesProvider>
      </UserProvider>
    </AuthProvider>
  );
} 