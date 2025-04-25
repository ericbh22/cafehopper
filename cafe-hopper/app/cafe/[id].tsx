// CafeDetailsScreen.tsx
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ReviewForm from '../components/reviewform';
import { useState, useEffect } from 'react';
import { getCafeById, getReviewsForCafe, getUserById, updateUserLocation, addReview } from '../database';
import { useCafes } from '../context/cafes';
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
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewInput {
  comment: string;
  ratings: {
    ambience?: number;
    service?: number;
    sound?: number;
    drinks?: number;
  };
}

interface User {
  id: string;
  name: string;
  location?: string;
  avatar?: string;
  friends?: string[];
}

export default function CafeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const { cafes } = useCafes();
  const [cafe, setCafe] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHere, setIsHere] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const cafeId = parseInt(id as string);
        const cafeData = await getCafeById(cafeId);
        const reviewsData = await getReviewsForCafe(cafeId);

        const reviewsWithUsers: Review[] = await Promise.all(
          reviewsData.map(async (review: any) => {
            const userData = await getUserById(review.userId);
            let timestamp = review.timestamp;

            if (timestamp?.toDate) {
              timestamp = timestamp.toDate();
            } else if (typeof timestamp === 'string') {
              timestamp = new Date(timestamp);
            } else if (!(timestamp instanceof Date)) {
              timestamp = new Date();
            }

            return {
              id: review.id,
              cafeId: review.cafeId,
              userId: review.userId,
              comment: review.comment,
              ratings: review.ratings,
              timestamp,
              user: userData ? {
                id: userData.id,
                name: userData.name,
                avatar: userData.avatar
              } : undefined,
            };
          })
        );

        setCafe(cafeData);
        setReviews(reviewsWithUsers);
      } catch (err) {
        console.error('Error loading cafe data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleStudyToggle = async () => {
    if (!currentUser) return;
    try {
      const newLocation = isHere ? null : id as string;
      await updateUserLocation(currentUser.id, newLocation);
      setIsHere(!isHere);
    } catch (error) {
      console.error('Error updating user location:', error);
    }
  };

  const submitReview = async (review: ReviewInput) => {
    if (!user) return;
    try {
      const timestamp = new Date();
      await addReview(parseInt(id as string), user.id, review.comment, review.ratings);
      setReviews([
        ...reviews,
        {
          id: Date.now().toString(),
          userId: user.id,
          cafeId: id as string,
          timestamp,
          comment: review.comment,
          ratings: review.ratings,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
        },
      ]);
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!cafe) {
    return <Text className="p-4">Cafe not found 😢</Text>;
  }

  const criteriaList = ['ambience', 'service', 'sound', 'drinks'] as const;
  type Criteria = typeof criteriaList[number];

  const averages: Record<Criteria, number> = { ambience: 0, service: 0, sound: 0, drinks: 0 };
  if (reviews.length > 0) {
    reviews.forEach((review) => {
      Object.entries(review.ratings).forEach(([key, val]) => {
        averages[key as Criteria] += val;
      });
    });
    Object.keys(averages).forEach((key) => {
      averages[key as Criteria] = parseFloat((averages[key as Criteria] / reviews.length).toFixed(1));
    });
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />

      <ScrollView className="flex-1 bg-white px-4 pt-12">
        <View className="flex-row items-center gap-x-2 mb-2">
          <Pressable onPress={() => router.back()} className="p-1 rounded-full">
            <Ionicons name="chevron-back" size={24} color="#1c1c1e" />
          </Pressable>
          <Text className="text-2xl font-bold">{cafe.name}</Text>
        </View>

        <Text className="text-gray-500 mb-2">{cafe.address}</Text>
        <Text className="text-gray-400 mb-4">Open: {cafe.hours}</Text>

        <ScrollView horizontal className="mb-4 space-x-2">
          {cafe.images ? JSON.parse(cafe.images).map((img: string, idx: number) => (
            <Image key={idx} source={{ uri: img }} className="w-60 h-36 rounded-xl" />
          )) : (
            <Image source={{ uri: cafe.image || 'https://source.unsplash.com/800x600/?cafe' }} className="w-60 h-36 rounded-xl" />
          )}
        </ScrollView>

        {reviews.length > 0 && (
          <View className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <Text className="font-semibold text-base mb-2">Overall Ratings</Text>
            <View className="flex flex-wrap flex-row gap-y-2">
              <View className="w-1/2"><Text className="text-sm">⭐️ Ambience: {averages.ambience}</Text></View>
              <View className="w-1/2"><Text className="text-sm">☕ Drinks: {averages.drinks}</Text></View>
              <View className="w-1/2"><Text className="text-sm">🤝 Service: {averages.service}</Text></View>
              <View className="w-1/2"><Text className="text-sm">🔇 Sound: {averages.sound}</Text></View>
            </View>
          </View>
        )}

        <Text className="text-lg font-semibold mt-4">Who's here now</Text>
        <Text className="mb-1">👥 Friends: {cafe.friendsHere?.join(', ') || 'None'}</Text>
        <Text className="text-gray-500 mb-2">Public users: {cafe.publicUsers}</Text>

        {currentUser && (
          <Pressable
            onPress={handleStudyToggle}
            className={`${isHere ? 'bg-red-500' : 'bg-green-500'} px-4 py-2 rounded-full self-start mb-4`}
          >
            <Text className="text-white font-medium">
              {isHere ? '❌ Stop Study Session' : '📍 Studying Here!'}
            </Text>
          </Pressable>
        )}

        <Text className="text-base font-semibold mt-4">Leave a Review</Text>
        <ReviewForm onSubmit={submitReview} />

        <Text className="text-lg font-semibold mb-2 pt-4">Reviews</Text>
        {reviews.map((review) => (
          <View key={review.id} className="mb-3 p-3 bg-gray-100 rounded-lg">
            <View className="flex-row items-center gap-x-2 mb-1">
              {review.user?.avatar && (
                <Image source={{ uri: review.user.avatar }} className="w-6 h-6 rounded-full" />
              )}
              <Text className="font-bold">{review.user?.name ?? 'Anonymous'}</Text>
              <Text className="text-xs text-gray-500">
                {review.timestamp ? review.timestamp.toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : 'Unknown date'}
              </Text>
            </View>
            <View className="flex-row justify-between flex-wrap gap-y-1 mb-1">
              {Object.entries(review.ratings).map(([key, value]) => (
                <View key={key} className="flex-row items-center">
                  <Text className="text-xs text-gray-700">
                    {key === 'ambience' ? '⭐️' : key === 'drinks' ? '☕' : key === 'service' ? '🤝' : '🔇'} {value}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="text-sm">{review.comment}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}
