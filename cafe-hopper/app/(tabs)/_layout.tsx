import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "/Users/erichuang/Documents/GitHub/ac final/cafehopper/cafe-hopper/app/globals.css"

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;

          switch (route.name) {
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'lists':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'add':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'friends':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="lists" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="friends" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
