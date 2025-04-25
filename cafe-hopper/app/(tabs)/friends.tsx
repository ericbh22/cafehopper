import { ScrollView, View, Text, Image, Pressable, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserById, getFriends, updateUserFriends, getCafeById, getCafes } from '../database';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCafes } from '../context/cafes';
import { useUser } from '../context/user';

interface User {
    id: string;
    name: string;
    location?: string;
    avatar?: string;
    friends?: string[];
}

interface Cafe {
    id: string;
    name: string;
    address: string;
    area: string;
}

export default function FriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addQuery, setAddQuery] = useState('');
    const { user, loading: userLoading, error: userError, refreshUser } = useUser();
    const { cafes, loading: cafesLoading } = useCafes();
    const [friends, setFriends] = useState<User[]>([]);
    const [potentialFriends, setPotentialFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cafeLocations, setCafeLocations] = useState<Record<string, Cafe>>({});

    const loadFriends = async () => {
        if (!user?.friends?.length) {
            setFriends([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const friendsData = await Promise.all(
                user.friends.map(id => getUserById(id))
            );
            setFriends(friendsData.filter((friend): friend is User => friend !== null));
            
            // Load cafe locations for friends who are at cafes
            const cafeLocationsMap: Record<string, any> = {};
            for (const friend of friendsData) {
                if (friend?.location) {
                    const cafe = await getCafeById(parseInt(friend.location));
                    if (cafe) {
                        cafeLocationsMap[friend.id] = cafe;
                    }
                }
            }
            setCafeLocations(cafeLocationsMap);
        } catch (err) {
            setError('Failed to load friends');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFriends();
    }, [user]);

    const searchUsers = async (searchText: string) => {
        if (!searchText.trim()) {
            setPotentialFriends([]);
            return;
        }

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('name', '>=', searchText), where('name', '<=', searchText + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as User[];

            // Filter out current user and existing friends
            const currentFriends = new Set(friends.map(f => f.id));
            const filteredUsers = users.filter(user => 
                user.id !== user?.id && !currentFriends.has(user.id)
            );

            setPotentialFriends(filteredUsers);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const addFriend = async (userId: string) => {
        if (!user) return;
        try {
            const updatedFriends = [...(user.friends || []), userId];
            await updateUserFriends(user.id, updatedFriends);
            await refreshUser();
            setShowAddModal(false);
            setAddQuery('');
            loadFriends(); // Reload friends list
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    };

    if (userLoading || cafesLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!user) {
        return <Text className="p-4">User not found</Text>;
    }

    const filteredFriends = friends.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onlineFriends = filteredFriends.filter(user => !!user.location);
    const offlineFriends = filteredFriends.filter(user => !user.location);


  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12" keyboardDismissMode='on-drag'>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">👥 Hoppers</Text>
        <Pressable
          onPress={() => setShowAddModal(true)}
          className="px-4 py-1 bg-[#473319] rounded-full"
        >
          <Text className="text-white font-medium text-sm">Add</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="flex-1" >
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder = {"Search Hoppers..."}/>
      </View>

      {/* Online Friends */}
      <Text className="text-lg font-semibold mb-2 text-green-700">🟢 Studying Now</Text>
      {onlineFriends.length === 0 ? (
        <Text className="text-gray-500 mb-4">No friends currently studying.</Text>
      ) : (
                onlineFriends.map((friend) => {
                    const cafe = cafeLocations[friend.id];
          return (
            <Pressable
                            key={friend.id}
                            onPress={() => router.push(`/users/${friend.id}`)}
              className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-200"
            >
                            <Image 
                                source={{ uri: friend.avatar || 'https://i.pravatar.cc/150' }} 
                                className="w-10 h-10 rounded-full mr-3" 
                            />
              <View>
                                <Text className="font-medium">{friend.name}</Text>
                {cafe && <Text className="text-sm text-blue-600">📍 {cafe.name}</Text>}
              </View>
            </Pressable>
          );
        })
      )}

      {/* Offline Friends */}
      <Text className="text-lg font-semibold mb-2 text-gray-700 mt-6">⚪️ Not Studying</Text>
      {offlineFriends.length === 0 ? (
        <Text className="text-gray-500">Everyone is currently studying!</Text>
      ) : (
                offlineFriends.map((friend) => (
          <Pressable
                        key={friend.id}
                        onPress={() => router.push(`/users/${friend.id}`)}
            className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-100"
          >
                        <Image 
                            source={{ uri: friend.avatar || 'https://i.pravatar.cc/150' }} 
                            className="w-10 h-10 rounded-full mr-3" 
                        />
                        <Text className="font-medium">{friend.name}</Text>
          </Pressable>
        ))
      )}

            {/* Add Friend Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <ScrollView className="flex-1 bg-white px-4 pt-12">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-semibold">Add a Friend</Text>
                        <Pressable
                            onPress={() => setShowAddModal(false)}
                            className="px-3 py-1 bg-gray-200 rounded-full"
                        >
                            <Text className="text-sm">Close</Text>
                        </Pressable>
                    </View>
                    <TextInput
                        placeholder="Search users..."
                        value={addQuery}
                        onChangeText={(text) => {
                            setAddQuery(text);
                            searchUsers(text);
                        }}
                        className="bg-gray-100 rounded-full px-4 py-2 mb-4 text-base text-gray-700"
                    />
                    
                    {potentialFriends.length > 0 ? (
                        potentialFriends.map((user) => (
                            <Pressable
                                key={user.id}
                                onPress={() => addFriend(user.id)}
                                className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-200"
                            >
                                <Image 
                                    source={{ uri: user.avatar || 'https://i.pravatar.cc/150' }} 
                                    className="w-10 h-10 rounded-full mr-3" 
                                />
                                <View className="flex-1">
                                    <Text className="font-medium">{user.name}</Text>
                                </View>
                                <Pressable
                                    onPress={() => addFriend(user.id)}
                                    className="px-3 py-1 bg-blue-600 rounded-full"
                                >
                                    <Text className="text-white text-sm">Add</Text>
                                </Pressable>
                            </Pressable>
                        ))
                    ) : (
                        <Text className="text-gray-500 text-center py-4">
                            {addQuery ? 'No users found' : 'Search for users to add as friends'}
                        </Text>
                    )}
                </ScrollView>
            </Modal>
    </ScrollView>
  );
}
