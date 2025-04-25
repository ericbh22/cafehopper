import { View, Text, ScrollView, Image, Pressable, TextInput } from 'react-native';
import { users } from '../data/user';
import { cafes } from '../data/data';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function FriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = filteredUsers.filter((user) => !!user.location);
  const offlineFriends = filteredUsers.filter((user) => !user.location);

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
      <Text className="text-2xl font-bold mb-4">👥 Friends</Text>

      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
        <TextInput
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-base text-gray-700"
        />
      </View>

      {/* Online */}
      <Text className="text-lg font-semibold mb-2 text-green-700">🟢 Studying Now</Text>
      {onlineFriends.length === 0 ? (
        <Text className="text-gray-500 mb-4">No friends currently studying.</Text>
      ) : (
        onlineFriends.map((user) => {
          const cafe = cafes.find((c) => c.id === user.location);
          return (
            <Pressable
              key={user.id}
              onPress={() => router.push(`/users/${user.id}`)}
              className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-200"
            >
              <Image source={{ uri: user.avatar }} className="w-10 h-10 rounded-full mr-3" />
              <View>
                <Text className="font-medium">{user.name}</Text>
                {cafe && <Text className="text-sm text-blue-600">📍 {cafe.name}</Text>}
              </View>
            </Pressable>
          );
        })
      )}

      {/* Offline */}
      <Text className="text-lg font-semibold mb-2 text-gray-700 mt-6">⚪️ Not Studying</Text>
      {offlineFriends.length === 0 ? (
        <Text className="text-gray-500">Everyone is currently studying!</Text>
      ) : (
        offlineFriends.map((user) => (
          <Pressable
            key={user.id}
            onPress={() => router.push(`/users/${user.id}`)}
            className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-100"
          >
            <Image source={{ uri: user.avatar }} className="w-10 h-10 rounded-full mr-3" />
            <Text className="font-medium">{user.name}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
