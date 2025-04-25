import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { cafes } from '../data/data';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/searchbar';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCafes = cafes.filter((cafe) =>
    cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView
      className="flex-1 bg-white px-4 pt-12"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ minHeight: '100%', paddingBottom: 24 }}
    >
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      
      {searchQuery.length > 0 && ( // note we have to add stuff regarding loading, error etc later when we add a backend  
        <Text className="text-sm text-gray-500 mb-2">
          Currently searching: <Text className="font-semibold text-gray-700">"{searchQuery}"</Text>
        </Text>
      )}

      <Text className="text-xl font-bold mb-4">
        Showing {filteredCafes.length} venue{filteredCafes.length !== 1 ? 's' : ''}
      </Text>

      {filteredCafes.map((item) => ( // so now we only map the filetered cafes, not all cafes, which is all cafes that are queried 
        <Pressable
          key={item.id}
          onPress={() => router.push(`/cafe/${item.id}`)}
          className="mb-6 rounded-2xl overflow-hidden bg-white shadow"
        >
          <View className="relative">
            <Image source={{ uri: item.image }} className="h-48 w-full" resizeMode="cover" />
          </View>

          <View className="p-4">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Ionicons name="heart-outline" size={20} color="gray" />
            </View>
            <Text className="text-gray-500 text-xs mt-1">Dine-in • Takeaway</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
