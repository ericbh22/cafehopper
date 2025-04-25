import { Stack } from 'expo-router';
import "../globals.css";

export default function CafeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
        // This is important - use the native stack presentation
        presentation: 'modal',
      }}
    />
  );
}