import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../globals.css"

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
      <Tabs.Screen name="index"
      options = {{
        title: "Home",
        headerShown: false 
      }} />
      <Tabs.Screen name="lists" 
      options = {{
        title: "Lists",
        headerShown: false 
      }}/>
      <Tabs.Screen name="add"
      options = {{
        title: "add",
        headerShown: false 
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
