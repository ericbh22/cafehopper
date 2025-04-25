import { View, Text, Image, Pressable, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Cafe[]>([]);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
    const mapRef = useRef<MapView>(null);
    const markerRefs = useRef<{ [key: string]: Marker | null }>({});
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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = cafes.filter(cafe => 
            cafe.name.toLowerCase().includes(query.toLowerCase()) ||
            cafe.address.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);

        if (results.length > 0) {
            setRegion({
                latitude: results[0].latitude,
                longitude: results[0].longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }
    };

    const handleMarkerPress = (markerId: string) => {
        if (selectedMarkerId === markerId) {
            // If marker is already selected, navigate to cafe details
            router.push(`/cafe/${markerId}`);
            setSelectedMarkerId(null);
        } else {
            // Show callout for new selection
            setSelectedMarkerId(markerId);
            const marker = markerRefs.current[markerId];
            if (marker) {
                marker.showCallout();
            }
        }
    };

    const handleCalloutPress = (markerId: string) => {
        // Navigate to cafe details when callout is pressed
        router.push(`/cafe/${markerId}`);
        setSelectedMarkerId(null);
    };

    const handleCafeSelect = (cafe: Cafe) => {
        setSearchQuery(cafe.name);
        setSearchResults([]);
        setSelectedMarkerId(cafe.id);
        
        // Animate to the selected cafe's location
        mapRef.current?.animateToRegion({
            latitude: cafe.latitude,
            longitude: cafe.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);

        // Show the callout after a short delay to ensure the marker is visible
        setTimeout(() => {
            const marker = markerRefs.current[cafe.id];
            if (marker) {
                marker.showCallout();
            }
        }, 1100);

        Keyboard.dismiss();
    };

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
            <View className="absolute top-16 left-4 right-4 z-50">
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search for cafes..."
                />
                {searchResults.length > 0 && (
                    <View className="mt-2 bg-white rounded-lg shadow-lg max-h-60">
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleCafeSelect(item)}
                                    className="px-4 py-3 border-b border-gray-100"
                                >
                                    <Text className="font-semibold text-[#473319]">{item.name}</Text>
                                    <Text className="text-sm text-gray-600">{item.address}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>
            <MapView
                ref={mapRef}
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
                onPress={() => {
                    Keyboard.dismiss();
                    setSearchResults([]);
                    setSelectedMarkerId(null);
                }}
            >
                {cafeMarkers.map((marker) => (
                    <Marker
                        ref={ref => markerRefs.current[marker.id] = ref}
                        key={marker.id}
                        coordinate={marker.coordinate}
                        title={marker.title}
                        description={marker.description}
                        onPress={() => handleMarkerPress(marker.id)}
                        onCalloutPress={() => handleCalloutPress(marker.id)}
                        pinColor={marker.id === selectedMarkerId ? '#FF0000' : undefined}
                    />
                ))}
            </MapView>
        </View>
  );
}
