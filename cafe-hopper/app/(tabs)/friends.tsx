// app/friends.tsx
import { View, Text, ScrollView, Image } from 'react-native';
import { users } from '../data/user';
import { cafes } from '../data/data';
import { useRouter } from 'expo-router';

export default function FriendsScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
      <Text className="text-xl font-bold mb-4">📍 Friends' Study Locations</Text>

      {users.map((user) => {
        const cafe = cafes.find((c) => c.id === user.location);

        return (
          <View key={user.id} className="flex-row items-center mb-4 bg-gray-50 p-3 rounded-xl shadow-sm">
            <Image
              source={{ uri: user.avatar }}
              className="w-12 h-12 rounded-full mr-4"
            />
            <View className="flex-1">
              <Text className="font-semibold text-base">{user.name}</Text>
              {cafe ? (
                <Text
                  className="text-blue-600 text-sm"
                  onPress={() => router.push(`/cafe/${cafe.id}`)}
                >
                  📍 {cafe.name}
                </Text>
              ) : (
                <Text className="text-gray-500 text-sm">Not studying right now</Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
