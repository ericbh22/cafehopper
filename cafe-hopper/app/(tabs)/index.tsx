import { View, Text, Image, Pressable, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/searchbar';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useCafes } from '../context/cafes';
import { Cafe } from '../database';

type SortMode = 'default' | 'rating' | 'distance';

interface CafeWithComputed extends Partial<Cafe> {
    id: number;
    avgReview: number;
    distance: string | null;
}

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { cafes, loading } = useCafes();

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const calculateAvgReview = (cafe: any) => {
    if (!cafe.reviews || cafe.reviews.length === 0) return 0;
    const total = cafe.reviews.reduce((sum: number, review: any) => {
      const ratings = Object.values(review.ratings) as number[];
      return sum + ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
    }, 0);
    return total / cafe.reviews.length;
  };
  
  const filteredCafes = cafes
    .filter((cafe) =>
      cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cafe.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((cafe) => ({
      ...cafe,
      id: parseInt(cafe.id),
      avgReview: calculateAvgReview(cafe),
      distance:
        userLocation &&
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          cafe.latitude,
          cafe.longitude
        ),
    }))
    .sort((a, b) => {
      if (sortMode === 'rating') return b.avgReview - a.avgReview;
      if (sortMode === 'distance') return (parseFloat(a.distance ?? '0') - parseFloat(b.distance ?? '0'));
      return 0;
    });

  const renderHeader = () => (
    <View className="px-4 pt-12">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </View>
        <Pressable
          onPress={() => setShowDropdown((prev) => !prev)}
          className="ml-2 px-3 py-2 bg-gray-200 rounded-full"
        >
          <Ionicons name="filter" size={18} color="black" />
        </Pressable>
      </View>
      {showDropdown && (
        <View className="mb-4 bg-gray-100 rounded-lg px-3 py-2">
          {['default', 'rating', 'distance'].map((mode) => (
            <Pressable key={mode} onPress={() => { setSortMode(mode as SortMode); setShowDropdown(false); }} className="py-1">
              <Text className={`text-sm ${sortMode === mode ? 'font-semibold text-blue-600' : 'text-gray-800'}`}>{mode === 'default' ? 'Relevance' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
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
    </View>
  );

  const renderCafe = ({ item }: { item: CafeWithComputed }) => (
    <Link href={`/cafe/${item.id}`} asChild>
      <TouchableOpacity className="p-4 border-b border-gray-200">
        <View className="flex-row">
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/100' }}
            className="w-20 h-20 rounded-lg"
          />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold">{item.name}</Text>
            <Text className="text-gray-600">{item.address}</Text>
            <Text className="text-gray-500">{item.area}</Text>
            {item.distance && (
              <Text className="text-sm text-gray-500">{item.distance} km away</Text>
            )}
            {item.avgReview > 0 && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text className="text-sm text-gray-600 ml-1">{item.avgReview.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-base text-gray-700">Loading venues...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        <View className="px-4 pt-12">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </View>
            <Pressable
              onPress={() => setShowDropdown((prev) => !prev)}
              className="ml-2 px-3 py-2 bg-gray-200 rounded-full"
            >
              <Ionicons name="filter" size={18} color="black" />
            </Pressable>
          </View>
          {showDropdown && (
            <View className="mb-4 bg-gray-100 rounded-lg px-3 py-2">
              {['default', 'rating', 'distance'].map((mode) => (
                <Pressable key={mode} onPress={() => { setSortMode(mode as SortMode); setShowDropdown(false); }} className="py-1">
                  <Text className={`text-sm ${sortMode === mode ? 'font-semibold text-blue-600' : 'text-gray-800'}`}>{mode === 'default' ? 'Relevance' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
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
        </View>

        <FlatList<CafeWithComputed>
          data={filteredCafes}
          renderItem={renderCafe}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </KeyboardAvoidingView>
  );
}
