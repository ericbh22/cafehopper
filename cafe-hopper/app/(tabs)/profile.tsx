// ProfileScreen.tsx
import { View, Text, ScrollView, Image } from 'react-native';
import { cafes } from '../data/data';
import { getCurrentUser } from '../context/currentUser';
import { users } from '../data/user';

const currentUser = getCurrentUser(users);

const currentUserId = 'u1';

export default function ProfileScreen() {
  if (!currentUser) return <Text className="p-4">User not found</Text>;

  // Get all reviews left by the current user
  const userReviews = cafes.flatMap(cafe =>
    cafe.reviews.filter(review => review.userId === currentUserId).map(review => ({
      ...review,
      cafeName: cafe.name
    }))
  );

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
      <View className="items-center mb-6">
        <Image
          source={{ uri: currentUser.avatar }}
          className="w-24 h-24 rounded-full mb-2"
        />
        <Text className="text-xl font-bold">{currentUser.name}</Text>
        <Text className="text-gray-600">
          {currentUser.location
            ? `Currently at: ${cafes.find((c) => c.id === currentUser.location)?.name}`
            : 'Not currently studying at a cafe'}
        </Text>
      </View>

      <Text className="text-lg font-semibold mb-2">Past Reviews</Text>
      {userReviews.length === 0 ? (
        <Text className="text-gray-500">No reviews yet.</Text>
      ) : (
        userReviews.map((review, idx) => (
          <View key={idx} className="mb-4 p-4 bg-gray-100 rounded-lg">
            <Text className="font-semibold mb-1">{review.cafeName}</Text>
            <View className="flex-row justify-between flex-wrap gap-y-1 mb-1">
              <Text className="text-xs text-gray-700">⭐️ {review.ratings.ambience}</Text>
              <Text className="text-xs text-gray-700">☕ {review.ratings.drinks}</Text>
              <Text className="text-xs text-gray-700">🤝 {review.ratings.service}</Text>
              <Text className="text-xs text-gray-700">🔇 {review.ratings.sound}</Text>
            </View>
            <Text className="text-sm">{review.comment}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
