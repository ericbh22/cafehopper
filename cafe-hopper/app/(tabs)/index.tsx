import { ScrollView, View, Text, Image, Pressable, TextInput } from 'react-native';
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
      <Text className="text-xl font-bold mb-4">Showing {cafes.length} venues</Text>
      
      {cafes.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => router.push(`/cafe/${item.id}`)}
          className="mb-6 rounded-2xl overflow-hidden bg-white shadow"
        >
          <View className="relative">
            <Image source={{ uri: item.image }} className="h-48 w-full" resizeMode="cover" />
            <View className="absolute top-2 left-2">
              {item.promo.map((label, index) => (
                <View key={index} className="bg-red-500 px-2 py-1 rounded mb-1">
                  <Text className="text-white text-xs font-bold">{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="p-4">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Ionicons name="heart-outline" size={20} color="gray" />
            </View>
            <Text className="text-gray-600">{item.distance} Away</Text>
            <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
              {item.tags.join(', ')}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">Dine-in • Takeaway</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
