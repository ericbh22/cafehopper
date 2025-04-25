import { View, Text, ScrollView, Image } from 'react-native';
import { cafes } from '../data/data';
import { getCurrentUser } from '../context/currentUser';
import { users } from '../data/user';
const reviewIcon = require('../../assets/images/reviewicon.png');
const currentUser = getCurrentUser(users);
const currentUserId = currentUser?.id;

export default function ProfileScreen() {
  if (!currentUser) return <Text className="p-4">User not found</Text>;

  const userReviews = cafes.flatMap(cafe =>
    cafe.reviews.filter(review => review.userId === currentUserId).map(review => ({
      ...review,
      cafeName: cafe.name
    }))
  );

  const currentCafe = cafes.find((c) => c.id === currentUser.location);

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">

      <View className="items-center mb-6">
        <View className="relative">
          <Image source={{ uri: currentUser.avatar }} className="w-24 h-24 rounded-full" />
          {/* Additional badge or overlay here if needed */}
        </View>
        <Text className="text-xl font-bold mt-2">{currentUser.name}</Text>
        {currentCafe && (
          <View className="flex-row items-center mt-2">
            <Text className="text-[#473319] mr-1"></Text>
            <Text className="text-base text-[#473319] font-medium bg-[#f7dbb2] rounded-md px-2 py-0.5 border border-[#473319]">
            📍{currentCafe.name}
            </Text>
          </View>
        )}
        <View className="flex-row justify-center items-center gap-x-6 mt-3">
          <View className="flex-row items-center">
            <Text className="text-lg text-[#3a5a91]">👥</Text>
            <Text className="text-sm text-[#473319] ml-1">{currentUser.friends?.length ?? 0}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-lg text-[#aa6b2c]">💬</Text>
            <Text className="text-sm text-[#473319] ml-1">{userReviews.length}</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center mb-2">
    <Image source={reviewIcon} className="w-9 h-9 mr-2" />
    <Text className="text-lg font-semibold text-left mb-2 text-[#473319]">Cafe Reviews</Text>
    </View>
      <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4">
        {userReviews.length === 0 ? (
          <Text className="text-gray-500">No reviews yet.</Text>
        ) : (
          userReviews.map((review, idx) => (
            <View key={idx} className="mb-4 p-4 bg-white rounded-lg border border-[#eee]">
              <Text className="font-semibold mb-1 text-[#473319]">{review.cafeName}</Text>
              <View className="flex-row justify-between flex-wrap gap-y-1 mb-1">
                <Text className="text-xs text-gray-700">⭐️ {review.ratings.ambience}</Text>
                <Text className="text-xs text-gray-700">☕ {review.ratings.drinks}</Text>
                <Text className="text-xs text-gray-700">🤝 {review.ratings.service}</Text>
                <Text className="text-xs text-gray-700">🔇 {review.ratings.sound}</Text>
              </View>
              <Text className="text-sm text-gray-800">{review.comment}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
