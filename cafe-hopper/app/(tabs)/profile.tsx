import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserById, getReviewsByUserId, getCafeById } from '../database';
import { useUser, defaultProfilePicture } from '../context/user';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import AvatarUpload from '../components/AvatarUpload';
const reviewIcon = require('../../assets/images/reviewicon.png');

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
  location: string | null;
  avatar?: string;
  friends?: string[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentCafe, setCurrentCafe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const userData = await getUserById(user.id);
        setCurrentUser(userData);

        if (userData) {
          const reviewsData = await getReviewsByUserId(user.id);
          const reviewsWithCafes = await Promise.all(
            reviewsData.map(async (review) => {
              const cafe = await getCafeById(parseInt(review.cafeId));
              return {
                ...review,
                cafe: cafe
                  ? {
                      id: cafe.id,
                      name: cafe.name,
                      address: cafe.address,
                      area: cafe.area,
                    }
                  : undefined,
              };
            })
          );
          setReviews(reviewsWithCafes);

          if (userData.location) {
            const cafeData = await getCafeById(parseInt(userData.location));
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!auth.currentUser) {
                throw new Error('No user logged in');
              }

              // Delete user document from Firestore
              await deleteDoc(doc(db, 'users', user?.id || ''));

              // Delete user from Firebase Auth
              await deleteUser(auth.currentUser);

              // Logout and redirect to login
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        avatar: newAvatar
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#473319" />
        <Text className="text-[#473319] mt-2">Loading profile...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return <Text className="p-4">User not found</Text>;
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
      <View className="items-center mb-6">
        <AvatarUpload
          currentAvatar={currentUser.avatar}
          userId={currentUser.id}
          onAvatarUpdate={handleAvatarUpdate}
        />
        <Text className="text-xl font-bold mt-2">{currentUser.name}</Text>
        {currentUser.location && currentCafe && (
          <Pressable onPress={() => router.push(`/cafe/${currentCafe.id}`)} className="mt-2">
            <View className="flex-row items-center">
              <Text className="text-base text-[#473319] font-medium bg-[#f7dbb2] rounded-md px-2 py-0.5 border border-[#473319]">
                📍{currentCafe.name}
              </Text>
            </View>
          </Pressable>
        )}
        <View className="flex-row justify-center items-center gap-x-6 mt-3">
          <View className="flex-row items-center">
            <Text className="text-lg text-[#3a5a91]">👥</Text>
            <Text className="text-sm text-[#473319] ml-1">{currentUser.friends?.length ?? 0}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-lg text-[#aa6b2c]">💬</Text>
            <Text className="text-sm text-[#473319] ml-1">{reviews.length}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Image source={reviewIcon} className="w-9 h-9 mr-2" />
        <Text className="text-lg font-semibold text-left mb-2 text-[#473319]">Cafe Reviews</Text>
      </View>

      <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4">
        {reviews.length === 0 ? (
          <Text className="text-gray-500">No reviews yet.</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} className="mb-4 p-4 bg-white rounded-lg border border-[#eee]">
              {review.cafe && (
                <Pressable onPress={() => router.push(`/cafe/${review.cafeId}`)} className="mb-2">
                  <Text className="font-semibold text-[#473319]">{review.cafe.name}</Text>
                  <Text className="text-sm text-gray-500">{review.cafe.area}</Text>
                </Pressable>
              )}
              <Text className="text-sm text-gray-800">{review.comment}</Text>
              <View className="flex-row justify-between flex-wrap gap-y-1 mt-2">
                <Text className="text-xs text-gray-700">⭐️ {review.ratings.ambience}</Text>
                <Text className="text-xs text-gray-700">☕ {review.ratings.drinks}</Text>
                <Text className="text-xs text-gray-700">🤝 {review.ratings.service}</Text>
                <Text className="text-xs text-gray-700">🔇 {review.ratings.sound}</Text>
              </View>
              <Text className="text-xs text-gray-400 mt-2">
                {new Date(review.timestamp?.toDate()).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      <View className="mt-8 mb-12">
        <Pressable
          onPress={handleLogout}
          className="bg-[#473319] rounded-lg py-3 px-4 mb-4"
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </Pressable>
        
        <Pressable
          onPress={handleDeleteAccount}
          className="bg-red-500 rounded-lg py-3 px-4"
        >
          <Text className="text-white text-center font-semibold">Delete Account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}