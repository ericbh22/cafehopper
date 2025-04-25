import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { getUserById, getReviewsByUserId } from '../database';
import { getCafeById } from '../database';

interface Review {
    id: string;
    cafeId: string;
    userId: string;
    comment: string;
    ratings: {
        ambience?: number;
        service?: number;
        sound?: number;
        drinks?: number;
    };
    timestamp: any;
    cafe?: {
        id: number;
        name: string;
        address: string;
        area: string;
    };
}

interface User {
    id: string;
    name: string;
    location?: string;
    avatar?: string;
    friends?: string[];
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentCafe, setCurrentCafe] = useState<any>(null);

    useEffect(() => {
        loadUserData();
        getLocation();
    }, [id]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const userData = await getUserById(id as string);
            if (userData) {
                setUser(userData);
                if (userData.location) {
                    const cafeData = await getCafeById(parseInt(userData.location));
                    setCurrentCafe(cafeData);
                }
                const userReviews = await getReviewsByUserId(id as string);
                const reviewsWithCafes = await Promise.all(
                    userReviews.map(async (review) => {
                        const cafe = await getCafeById(parseInt(review.cafeId));
                        return {
        ...review,
                            cafe: cafe ? {
                                id: cafe.id,
                                name: cafe.name,
                                address: cafe.address,
                                area: cafe.area
                            } : undefined
                        };
                    })
                );
                setReviews(reviewsWithCafes);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLocation = async () => {
        try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Loading...</Text>
            </View>
        );
    }

  if (!user) {
    return <Text className="p-4">User not found 😢</Text>;
  }

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

  return (
        <ScrollView className="flex-1 bg-white">
            <Stack.Screen
                options={{
                    title: user.name,
                    headerRight: () => (
                        <Pressable onPress={() => router.push('/settings')}>
                            <Ionicons name="settings-outline" size={24} color="black" />
        </Pressable>
                    ),
                }}
            />
            
            <View className="p-4">
                <View className="items-center mb-4">
                    <Image
                        source={{ uri: user.avatar || 'https://i.pravatar.cc/150' }}
                        className="w-24 h-24 rounded-full mb-2"
                    />
                    <Text className="text-xl font-bold">{user.name}</Text>
                    {currentCafe && (
                        <Pressable 
                            onPress={() => router.push(`/cafe/${currentCafe.id}`)}
                            className="mt-2"
                        >
                            <View className="flex-row items-center">
                                <Text className="text-base text-[#473319] font-medium bg-[#f7dbb2] rounded-md px-2 py-0.5 border border-[#473319]">
                                    📍{currentCafe.name}
                                </Text>
                            </View>
                        </Pressable>
                    )}
                </View>

                <View className="mb-4">
                    <Text className="text-lg font-semibold mb-2">Reviews</Text>
                    {reviews.map((review) => (
                        <View key={review.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                            {review.cafe && (
                                <Pressable 
                                    onPress={() => router.push(`/cafe/${review.cafeId}`)}
                                    className="mb-2"
                                >
                                    <Text className="font-semibold text-blue-600">{review.cafe.name}</Text>
                                    <Text className="text-sm text-gray-500">{review.cafe.area}</Text>
                                </Pressable>
                            )}
                            <Text className="text-sm text-gray-600">{review.comment}</Text>
                            <View className="flex-row justify-between flex-wrap gap-y-1 mt-2">
                                {Object.entries(review.ratings).map(([key, value]) => (
                                    <Text key={key} className="text-xs text-gray-700">
                                        {key === 'ambience' ? '⭐️' : key === 'drinks' ? '☕' : key === 'service' ? '🤝' : '🔇'} {value}
                                    </Text>
                                ))}
                            </View>
                            <Text className="text-xs text-gray-400 mt-2">
                                {new Date(review.timestamp?.toDate()).toLocaleDateString()}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
    </ScrollView>
  );
}
