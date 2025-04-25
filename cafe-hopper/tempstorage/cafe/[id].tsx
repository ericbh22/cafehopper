// CafeDetailsScreen.tsx
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cafes } from "../data/data";
import { users } from "../data/user";
import ReviewForm from '../components/reviewform';
import { useState, useEffect } from 'react';

export default function CafeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const cafe = cafes.find((c) => c.id === id);
  const router = useRouter();

  const currentUserId = 'u1';
  const currentUser = users.find((u) => u.id === currentUserId);
  const [isHere, setIsHere] = useState(false);

  useEffect(() => {
    if (currentUser?.location === id) {
      setIsHere(true);
    }
  }, [id]);

  const handleStudyToggle = () => {
    if (!currentUser) return;
    if (!isHere) {
      currentUser.location = id as string;
      cafe?.friendsHere.push(currentUser.name);
    } else {
      currentUser.location = undefined;
      cafe!.friendsHere = cafe!.friendsHere.filter(name => name !== currentUser.name);
    }
    setIsHere(!isHere);
  };

  if (!cafe) {
    return <Text className="p-4">Cafe not found 😢</Text>;
  }

  const criteriaList = ['ambience', 'service', 'sound', 'drinks'] as const;
  type Criteria = typeof criteriaList[number];

  const averages: Record<Criteria, number> = { ambience: 0, service: 0, sound: 0, drinks: 0 };
  if (cafe.reviews.length > 0) {
    cafe.reviews.forEach((review) => {
      Object.entries(review.ratings).forEach(([key, val]) => {
        averages[key as Criteria] += val;
      });
    });
    Object.keys(averages).forEach((key) => {
      averages[key as Criteria] = parseFloat((averages[key as Criteria] / cafe.reviews.length).toFixed(1));
    });
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />

      <ScrollView className="flex-1 bg-white px-4 pt-12">
        <View className="flex-row items-center gap-x-2 mb-2">
          <Pressable
            onPress={() => router.back()}
            className="p-1 rounded-full"
          >
            <Ionicons name="chevron-back" size={24} color="#1c1c1e" />
          </Pressable>
          <Text className="text-2xl font-bold">{cafe.name}</Text>
        </View>

        <Text className="text-gray-500 mb-2">{cafe.address}</Text>
        <Text className="text-gray-400 mb-4">Open: {cafe.hours}</Text>

        <ScrollView horizontal className="mb-4 space-x-2">
          {cafe.images?.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} className="w-60 h-36 rounded-xl" />
          ))}
        </ScrollView>

        {cafe.reviews.length > 0 && (
          <View className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <Text className="font-semibold text-base mb-2">Overall Ratings</Text>
            <View className="flex flex-wrap flex-row gap-y-2">
              <View className="w-1/2">
                <Text className="text-sm">⭐️ Ambience: {averages.ambience}</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-sm">☕ Drinks: {averages.drinks}</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-sm">🤝 Service: {averages.service}</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-sm">🔇 Sound: {averages.sound}</Text>
              </View>
            </View>
          </View>
        )}

        <Text className="text-lg font-semibold mt-4">Who's here now</Text>
        <Text className="mb-1">👥 Friends: {cafe.friendsHere.join(', ') || 'None'}</Text>
        <Text className="text-gray-500 mb-2">Public users: {cafe.publicUsers}</Text>

        <Pressable
          onPress={handleStudyToggle}
          className={`${isHere ? 'bg-red-500' : 'bg-green-500'} px-4 py-2 rounded-full self-start mb-4`}
        >
          <Text className="text-white font-medium">
            {isHere ? '❌ Stop Study Session' : '📍 Studying Here!'}
          </Text>
        </Pressable>

        <Text className="text-base font-semibold mt-4">Leave a Review</Text>
        <ReviewForm onSubmit={(review) => cafe.reviews.push(review)} />

        <Text className="text-lg font-semibold mb-2 pt-4">Reviews</Text>
        {cafe.reviews.map((review, idx) => {
          const user = users.find((u) => u.id === review.userId);
          return (
            <View key={idx} className="mb-3 p-3 bg-gray-100 rounded-lg">
              <View className="flex-row items-center gap-x-2 mb-1">
                {user?.avatar && (
                  <Image source={{ uri: user.avatar }} className="w-6 h-6 rounded-full" />
                )}
                <Text className="font-bold">{user?.name ?? 'Anonymous'}</Text>
              </View>
              <View className="flex-row justify-between flex-wrap gap-y-1 mb-1">
                <Text className="text-xs text-gray-700">⭐️ {review.ratings.ambience}</Text>
                <Text className="text-xs text-gray-700">☕ {review.ratings.drinks}</Text>
                <Text className="text-xs text-gray-700">🤝 {review.ratings.service}</Text>
                <Text className="text-xs text-gray-700">🔇 {review.ratings.sound}</Text>
              </View>
              <Text>{review.comment}</Text>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}
