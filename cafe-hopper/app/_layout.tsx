import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from './database';
import { CafesProvider } from './context/cafes';
import { UserProvider } from './context/user';

export default function Layout() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            try {
                await initDatabase();
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing database:', error);
            }
        };
        initialize();
    }, []);

    if (!isInitialized) {
        return null; // or a loading screen
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