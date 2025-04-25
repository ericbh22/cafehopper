// ProfileScreen.tsx
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserById, getReviewsByUserId, getCafeById } from '../database';
import { useUser } from '../context/user';

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

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [currentCafe, setCurrentCafe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                // Get current user from Firebase
                const userData = await getUserById(user.id);
                setCurrentUser(userData);

                if (userData) {
                    // Get user's reviews from Firebase
                    const reviewsData = await getReviewsByUserId(user.id);
                    
                    // Fetch cafe information for each review
                    const reviewsWithCafes = await Promise.all(
                        reviewsData.map(async (review) => {
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

                    // Get current cafe from SQLite if user is at a cafe
                    if (userData.location) {
                        const cafeData = await getCafeById(userData.location);
                        setCurrentCafe(cafeData);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!currentUser) {
        return <Text className="p-4">User not found</Text>;
    }

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
            <View className="flex-row items-center gap-x-3 mb-4">
        <Image
                    source={{ uri: currentUser.avatar || 'https://i.pravatar.cc/150' }} 
                    className="w-16 h-16 rounded-full" 
        />
                <View>
        <Text className="text-xl font-bold">{currentUser.name}</Text>
                    <Text className="text-gray-500">@{currentUser.id}</Text>
                </View>
      </View>

            {currentCafe ? (
                <View className="bg-green-50 p-4 rounded-lg mb-4">
                    <Text className="text-green-700 font-semibold mb-1">📍 Currently Studying At</Text>
                    <Text className="text-lg font-medium">{currentCafe.name}</Text>
                    <Text className="text-gray-600">{currentCafe.address}</Text>
                </View>
            ) : (
                <View className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Text className="text-gray-700">Not currently studying anywhere</Text>
                </View>
            )}

      <Text className="text-lg font-semibold mb-2">Past Reviews</Text>
            {reviews.length === 0 ? (
                <Text className="text-gray-500">No reviews yet</Text>
      ) : (
                reviews.map((review) => (
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
                        <View className="flex-row mt-2">
                            {Object.entries(review.ratings).map(([key, value]) => (
                                <Text key={key} className="text-sm text-gray-500 mr-4">
                                    {key}: {value}
                                </Text>
                            ))}
            </View>
                        <Text className="text-xs text-gray-400 mt-2">
                            {new Date(review.timestamp?.toDate()).toLocaleDateString()}
                        </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
