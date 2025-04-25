import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css"

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#473319' },
        headerTintColor: '#f7dbb2',
        gestureEnabled: true,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 50, // ↓ smaller height (default is ~83)
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;
          switch (route.name) {
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'friends':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
              case 'map':
                iconName = focused ? 'map' : 'map-outline';
                break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index"
      options = {{
        title: "Home",
        headerShown: false 
      }} />
      <Tabs.Screen name="map"
      options = {{
        title: "map",
        headerShown: false,
      }} />
      <Tabs.Screen name="friends" 
      options = {{
        title: "friends",
        headerShown: false 
      }}/>
      <Tabs.Screen name="profile"
      options = {{
        title: "profile",
        headerShown: false 
      }} />

    </Tabs>
  );
}
