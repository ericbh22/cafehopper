// app/cafe/_layout.tsx or app/_layout.tsx
import { Stack } from 'expo-router';
import "../globals.css";

export default function CafeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: '',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
