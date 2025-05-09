// CafeDetailsScreen.tsx
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ReviewForm from '../components/reviewform';
import { useState, useEffect } from 'react';
import { getCafeById, getReviewsForCafe, getUserById, updateUserLocation, addReview, getFriends } from '../database';
import { useCafes } from '../context/cafes';
import { useUser, defaultProfilePicture } from '../context/user';

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
  location: string | null;
  avatar?: string;
  friends?: string[];
}

export default function CafeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user, refreshUser } = useUser();
  const { cafes } = useCafes();
  const [cafe, setCafe] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHere, setIsHere] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendsHere, setFriendsHere] = useState<User[]>([]);
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
        if (user) {
          setCurrentUser(user);
          setIsHere(user.location === id);
          
          // Load friends who are at this location
          const friends = await getFriends(user.id);
          const friendsAtLocation = friends.filter(friend => friend?.location === id);
          setFriendsHere(friendsAtLocation as User[]);
        }
      } catch (err) {
        console.error('Error loading cafe data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user]);

  const handleStudyToggle = async () => {
    if (!currentUser) return;
    try {
      const newLocation = isHere ? null : id as string;
      const success = await updateUserLocation(currentUser.id, newLocation);
      if (success) {
        setIsHere(!isHere);
        // Update the current user's location in the context
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            location: newLocation
          });
          // Refresh the user context to update the global state
          await refreshUser();
        }
      } else {
        console.error('Failed to update user location');
      }
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
          <Text className="text-2xl font-bold text-[#473319]">{cafe.name}</Text>
        </View>

        <View className="mb-4 border-2 border-[#473319] rounded-xl bg-[#f7dbb2]/30 p-4">
          <Text className="text-[#473319] mb-1">{cafe.address}</Text>
          <Text className="text-[#473319] mb-2">Open: {cafe.hours}</Text>
          <ScrollView horizontal className="space-x-2">
            {cafe.images ? (() => {
              let imageUrls: string[];
              try {
                // Try parsing as JSON first
                imageUrls = JSON.parse(cafe.images);
              } catch (e) {
                // If JSON parsing fails, treat as comma-separated string
                imageUrls = cafe.images.split(',').map((url: string) => url.trim());
              }
              return imageUrls.map((img: string, idx: number) => {
                return (
                  <Image 
                    key={idx} 
                    source={{ uri: img }} 
                    className="w-60 h-36 rounded-xl"
                    onError={(e) => {
                      console.error(`Error loading image ${idx}:`, e.nativeEvent.error);
                      console.error('Failed URL:', img);
                    }}
                  />
                );
              });
            })() : (
              <Image 
                source={{ uri: cafe.image || 'https://www.upmenu.com/wp-content/uploads/2022/08/Small-Cafe-Interior-Design.jpg' }} 
                className="w-60 h-36 rounded-xl"
                onError={(e) => {
                  console.error('Error loading default image:', e.nativeEvent.error);
                }}
              />
            )}
          </ScrollView>
        </View>

        {reviews.length > 0 && (
          <View className="border-2 border-[#473319] rounded-xl bg-[#f7dbb2]/20 p-4 mb-4">
            <Text className="font-semibold text-[#473319] mb-2">Overall Ratings</Text>
            <View className="flex flex-wrap flex-row gap-y-2">
              <Text className="w-1/2 text-sm text-[#473319]">⭐️ Ambience: {averages.ambience}</Text>
              <Text className="w-1/2 text-sm text-[#473319]">☕ Drinks: {averages.drinks}</Text>
              <Text className="w-1/2 text-sm text-[#473319]">🤝 Service: {averages.service}</Text>
              <Text className="w-1/2 text-sm text-[#473319]">🔇 Sound: {averages.sound}</Text>
            </View>
          </View>
        )}

        <View className="border-2 border-[#473319] rounded-xl bg-[#f7dbb2]/20 p-4 mb-4">
          <Text className="text-lg font-semibold text-[#473319] mb-2">Friends Here</Text>
          {friendsHere.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {friendsHere.map((friend) => (
                <Pressable
                  key={friend.id}
                  onPress={() => router.push(`/users/${friend.id}`)}
                  className="flex-row items-center gap-1 bg-[#473319]/10 p-2 rounded-lg active:bg-[#473319]/20"
                >
                  <Image source={friend.avatar ? { uri: friend.avatar } : defaultProfilePicture} className="w-6 h-6 rounded-full" />
                  <Text className="text-sm text-[#473319]">{friend.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-[#473319]">No friends currently here</Text>
          )}
        </View>

        {currentUser && (
          <Pressable
            onPress={handleStudyToggle}
            className={`${isHere ? 'bg-red-700' : 'bg-[#473319]'} px-4 py-2 rounded-full self-start mb-4`}
          >
            <Text className="text-white font-medium">
              {isHere ? '❌ Stop Study Session' : '📍 Studying Here!'}
            </Text>
          </Pressable>
        )}

        <Text className="text-base font-semibold text-[#473319] mt-4">Leave a Review</Text>
        <ReviewForm onSubmit={submitReview} />

        <Text className="text-lg font-semibold text-[#473319] mb-2 pt-4">Reviews</Text>
        {reviews.map((review) => (
          <View key={review.id} className="mb-3 p-4 bg-white rounded-lg border border-[#473319]/20">
            <View className="flex-row items-center gap-x-2 mb-1">
              <Image source={review.user?.avatar ? { uri: review.user.avatar } : defaultProfilePicture} className="w-6 h-6 rounded-full" />
              <Text className="font-bold text-[#473319]">{review.user?.name ?? 'Anonymous'}</Text>
              <Text className="text-xs text-gray-500">
                {review.timestamp ? review.timestamp.toLocaleDateString('en-AU', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : 'Unknown date'}
              </Text>
            </View>
            <View className="flex-row justify-between flex-wrap gap-y-1 mb-1">
              {Object.entries(review.ratings).map(([key, value]) => (
                <Text key={key} className="text-xs text-[#473319]">
                  {key === 'ambience' ? '⭐️' : key === 'drinks' ? '☕' : key === 'service' ? '🤝' : '🔇'} {value}
                </Text>
              ))}
            </View>
            <Text className="text-sm text-[#473319]">{review.comment}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}
