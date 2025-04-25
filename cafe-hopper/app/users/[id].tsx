import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cafes } from "../data/data";
import { users } from "../data/user";
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../context/currentUser';
import * as Location from 'expo-location';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const user = users.find((u) => u.id === id);
  const router = useRouter();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
    // Get all reviews left by the current user
    const userReviews = cafes.flatMap(cafe =>
      cafe.reviews.filter(review => review.userId === user?.id).map(review => ({
        ...review,
        cafeName: cafe.name
      }))
    );

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

  if (!user) {
    return <Text className="p-4">User not found 😢</Text>;
  }

  const cafe = cafes.find((c) => c.id === user.location);

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

  const distance =
    cafe && userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          cafe.location.latitude,
          cafe.location.longitude
        ).toFixed(2)
      : null;

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
      <View className="flex-row items-center gap-x-2 mb-2">
        <Pressable onPress={() => router.back()} className="p-1 rounded-full">
          <Ionicons name="chevron-back" size={24} color="#1c1c1e" />
        </Pressable>
      </View>

      <View className="items-center mb-6">
        <Image source={{ uri: user.avatar }} className="w-24 h-24 rounded-full mb-2" />
        <Text className="text-2xl font-bold">{user.name}</Text>
      </View>

      {cafe ? (
        <>
          <Text className="text-lg font-semibold mb-2 text-green-600">Currently Studying At</Text>
          <Text className="text-base mb-1">📍 {cafe.name}</Text>
          <Text className="text-sm text-gray-500 mb-1">{cafe.address}</Text>
          {distance && (
            <Text className="text-sm text-gray-700 mb-2">
              📏 {distance} km away from you
            </Text>
          )}
        </>
      ) : (
        <Text className="text-gray-500">Not currently studying at any cafe.</Text>
      )}
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
