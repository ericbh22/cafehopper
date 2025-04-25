import { View, Text ,StatusBar} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { cafes } from '../data/data'; // ← use your mock data
import { useRouter } from 'expo-router';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-base text-gray-700">📍 Loading map...</Text>
      </View>
    );
  }

  return (
    <MapView
        showsUserLocation
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          title={cafe.name}
          description={cafe.address}
          coordinate={{
            latitude: cafe.location.latitude,
            longitude: cafe.location.longitude,        
          }}
          onPress={() => router.push(`/cafe/${cafe.id}`)}
        />
      ))}
    </MapView>
  );
}
