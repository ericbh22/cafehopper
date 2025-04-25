import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { cafes } from '../data/data';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/searchbar';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
type SortMode = 'default' | 'rating' | 'distance';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  const calculateAvgReview = (cafe: typeof cafes[number]) => {
    if (!cafe.reviews || cafe.reviews.length === 0) return 0;
    let total = 0;
    cafe.reviews.forEach((r) => {
      const values = Object.values(r.ratings);
      total += values.reduce((a, b) => a + b, 0) / values.length;
    });
    return total / cafe.reviews.length;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const filteredCafes = cafes
    .filter((cafe) =>
      cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((cafe) => ({
      ...cafe,
      avgReview: calculateAvgReview(cafe),
      distance:
        userLocation &&
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          cafe.location.latitude,
          cafe.location.longitude
        ),
    }))
    .sort((a, b) => {
      if (sortMode === 'rating') return b.avgReview - a.avgReview;
      if (sortMode === 'distance') return (a.distance ?? 0) - (b.distance ?? 0);
      return 0;
    });

  return (
    <ScrollView
      className="flex-1 bg-white px-4 pt-12"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ minHeight: '100%', paddingBottom: 24 }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search Cafes..." />
        </View>
        <Pressable
          onPress={() => setShowDropdown((prev) => !prev)}
          className="ml-2 px-3 py-2 bg-[#f7dbb2] border border-[#473319] rounded-full"
        >
          <Ionicons name="filter" size={18} color="#473319" />
        </Pressable>
      </View>

      {showDropdown && (
        <View className="mb-4 bg-gray-100 rounded-lg px-3 py-2">
          {['default', 'rating', 'distance'].map((mode) => (
            <Pressable
              key={mode}
              onPress={() => {
                setSortMode(mode as SortMode);
                setShowDropdown(false);
              }}
              className="py-1"
            >
              <Text
                className={`text-sm ${
                  sortMode === mode ? 'font-semibold text-blue-600' : 'text-gray-800'
                }`}
              >
                {mode === 'default' ? 'Relevance' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {searchQuery.length > 0 && (
        <Text className="text-sm text-gray-500 mb-2">
          Currently searching: <Text className="font-semibold text-gray-700">"{searchQuery}"</Text>
        </Text>
      )}

      <Text className="text-xl font-bold mb-4">
        Showing {filteredCafes.length} venue{filteredCafes.length !== 1 ? 's' : ''}
      </Text>

      {filteredCafes.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => router.push(`/cafe/${item.id}`)}
          className="mb-6 rounded-2xl overflow-hidden border-2 border-[#473319] bg-[#f7dbb2]/30"
        >
          <View className="relative">
            <Image source={{ uri: item.image }} className="h-48 w-full" resizeMode="cover" />
          </View>

          <View className="p-4">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-lg font-semibold text-[#473319]">{item.name}</Text>
              <Ionicons name="heart-outline" size={20} color="#473319" />
            </View>
            <Text className="text-[#473319] text-xs mt-1">Dine-in • Takeaway</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
