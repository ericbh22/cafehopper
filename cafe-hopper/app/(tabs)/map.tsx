import { View, Text, Image, Pressable, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, Link } from 'expo-router';
import { getCafes } from '../database';
import { useCafes } from '../context/cafes';
import SearchBar from '../components/searchbar';
import { Ionicons } from '@expo/vector-icons';

interface Cafe {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

export default function MapScreen() {
    const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const { cafes, loading: cafesLoading, error: cafesError } = useCafes();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [region, setRegion] = useState({
        latitude: -33.8688,
        longitude: 151.2093,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    // Memoize the cafe markers to prevent unnecessary re-renders
    const cafeMarkers = useMemo(() => {
        return cafes.map((cafe) => ({
            id: cafe.id,
            coordinate: {
                latitude: (cafe.latitude),
                longitude: (cafe.longitude),
            },
            title: cafe.name,
            description: cafe.address,
        }));
    }, [cafes]);

    const loadLocation = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Check if we already have permission
            let { status } = await Location.getForegroundPermissionsAsync();
            
            // If we don't have permission, request it
            if (status !== 'granted') {
                const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                status = newStatus;
            }

      if (status !== 'granted') {
                setError('Location permission denied');
                setIsLoading(false);
        return;
      }

            // Get current location
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
            setRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        } catch (error) {
            console.error('Error loading location:', error);
            setError('Failed to load location');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLocation();
    }, [loadLocation]);

    const handleRegionChange = useCallback((newRegion: any) => {
        setRegion(newRegion);
  }, []);

    if (isLoading || cafesLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#666666" />
                <Text className="mt-4 text-base text-gray-700">Loading map...</Text>
            </View>
        );
    }

    if (error || cafesError) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-base text-red-500">{error || cafesError}</Text>
            </View>
        );
    }

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-base text-gray-700">📍 Please enable location services</Text>
      </View>
    );
  }

  return (
        <View className="flex-1">
    <MapView
        showsUserLocation
      style={{ flex: 1 }}
                initialRegion={region}
                onRegionChange={handleRegionChange}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                showsBuildings={true}
                showsTraffic={false}
                showsIndoors={true}
                loadingEnabled={true}
                loadingIndicatorColor="#666666"
                loadingBackgroundColor="#eeeeee"
    >
                {cafeMarkers.map((marker) => (
        <Marker
                        key={marker.id}
                        coordinate={marker.coordinate}
                        title={marker.title}
                        description={marker.description}
                        onPress={() => router.push(`/cafe/${marker.id}`)}
        />
      ))}
    </MapView>
        </View>
  );
}
