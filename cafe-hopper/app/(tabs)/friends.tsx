import { ScrollView, View, Text, Image, Pressable, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserById, updateUserFriends, getCafeById, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, getFriendRequests, getSentFriendRequests, checkExistingRequest } from '../database';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCafes } from '../context/cafes';
import { useUser, defaultProfilePicture } from '../context/user';
import SearchBar from '../components/searchbar';
const iconFriends = require('../../assets/images/friendsicon.png');
const iconOffline = require('../../assets/images/inactiveicon.png');
const iconRequests = require('../../assets/images/requestsicon.png');

interface User {
  id: string;
  name: string;
  location: string | null;
  avatar?: string;
  friends?: string[];
}

interface FriendRequest {
  id: string;
  fromUser: User | null;
  toUser: User | null;
  createdAt: Date;
}

interface Cafe {
  id: string;
  name: string;
  area: string;
}

export default function FriendsScreen() {
  const router = useRouter();
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const { user, loading: userLoading, refreshUser } = useUser();
  const { cafes, loading: cafesLoading } = useCafes();
  const [friends, setFriends] = useState<User[]>([]);
  const [potentialFriends, setPotentialFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [cafeLocations, setCafeLocations] = useState<Record<string, Cafe>>({});
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [requestStates, setRequestStates] = useState<Record<string, 'none' | 'sent' | 'pending'>>({});

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [user]);

  const loadFriendRequests = async () => {
    if (!user) return;
    const [received, sent] = await Promise.all([
      getFriendRequests(user.id),
      getSentFriendRequests(user.id)
    ]);
    setFriendRequests(received);
    setSentRequests(sent);

    // Update request states
    const states: Record<string, 'none' | 'sent' | 'pending'> = {};
    sent.forEach(request => {
      if (request.toUser) {
        states[request.toUser.id] = 'sent';
      }
    });
    received.forEach(request => {
      if (request.fromUser) {
        states[request.fromUser.id] = 'pending';
      }
    });
    setRequestStates(states);
  };

  const loadFriends = async () => {
    if (!user?.friends?.length) {
      setFriends([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const friendsData = await Promise.all(user.friends.map(id => getUserById(id)));
      const validFriends = friendsData.filter((f): f is User => f !== null);
      setFriends(validFriends);

      const cafeMap: Record<string, Cafe> = {};
      for (const friend of validFriends) {
        if (friend.location) {
          const cafe = await getCafeById(parseInt(friend.location));
          if (cafe) cafeMap[friend.id] = { ...cafe, id: cafe.id.toString() };
        }
      }
      setCafeLocations(cafeMap);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (text: string) => {
    if (!text.trim()) return setPotentialFriends([]);

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('name', '>=', text.toLowerCase()), where('name', '<=', text.toLowerCase() + '\uf8ff'));
    const snap = await getDocs(q);
    const found = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
    const ids = new Set([...friends.map(f => f.id), ...sentRequests.map(r => r.toUser?.id).filter(Boolean)]);
    const results = found.filter(u => u.id !== user?.id && !ids.has(u.id));
    setPotentialFriends(results);
  };

  const handleSendRequest = async (toUserId: string) => {
    if (!user) return;
    const success = await sendFriendRequest(user.id, toUserId);
    if (success) {
      await loadFriendRequests();
      setRequestStates(prev => ({ ...prev, [toUserId]: 'sent' }));
    }
  };

  const handleCancelRequest = async (requestId: string, toUserId: string) => {
    await cancelFriendRequest(requestId);
    await loadFriendRequests();
    setRequestStates(prev => ({ ...prev, [toUserId]: 'none' }));
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setLoading(true);
      const success = await acceptFriendRequest(requestId);
      if (success) {
        // Refresh both lists in parallel
        await Promise.all([
          loadFriends(),
          loadFriendRequests()
        ]);
        
        // Also refresh the current user's data
        if (user) {
          const updatedUser = await getUserById(user.id);
          if (updatedUser && updatedUser.friends) {
            // Update the user's friends list
            user.friends = updatedUser.friends;
            // Force a refresh of the user context
            refreshUser();
            // Update the friends state directly
            const friendsData = await Promise.all(updatedUser.friends.map(id => getUserById(id)));
            const validFriends = friendsData.filter((f): f is User => f !== null);
            setFriends(validFriends);
          }
        }
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || cafesLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) return <Text className="p-4">User not found</Text>;

  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(friendsSearchQuery.toLowerCase()));
  const online = filteredFriends.filter(f => !!f.location);
  const offline = filteredFriends.filter(f => !f.location);

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12" keyboardDismissMode='on-drag'>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">👥 Hoppers</Text>
        <Pressable onPress={() => setShowAddModal(true)} className="px-4 py-1 bg-[#473319] rounded-full">
          <Text className="text-white font-medium text-sm">Add</Text>
        </Pressable>
      </View>

      <View className="flex-1">
        <SearchBar value={friendsSearchQuery} onChange={setFriendsSearchQuery} placeholder="Search Hoppers..." />
      </View>

      {/* Friend Requests Section */}
      {friendRequests.length > 0 && (
        <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Image source={iconRequests} className="w-12 h-12 mr-2" />
            <Text className="text-lg font-semibold text-[#473319]">Friend Requests</Text>
          </View>
          <ScrollView className="max-h-72" nestedScrollEnabled>
            {friendRequests.map(request => (
              <View key={request.id} className="flex-row items-center justify-between mb-3 p-2 rounded-lg border border-gray-200">
                <View className="flex-row items-center">
                  <Image source={request.fromUser?.avatar ? { uri: request.fromUser.avatar } : defaultProfilePicture} className="w-10 h-10 rounded-full mr-3" />
                  <Text className="font-medium">{request.fromUser?.name}</Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable onPress={() => handleAcceptRequest(request.id)} className="px-3 py-1 bg-green-600 rounded-full">
                    <Text className="text-white text-sm">Accept</Text>
                  </Pressable>
                  <Pressable onPress={() => handleCancelRequest(request.id, request.fromUser?.id || '')} className="px-3 py-1 bg-red-600 rounded-full">
                    <Text className="text-white text-sm">Decline</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4 mb-6">
        <View className="flex-row items-center mb-2">
          <Image source={iconFriends} className="w-12 h-12 mr-2" />
          <Text className="text-lg font-semibold text-[#473319]">Studying Now</Text>
        </View>
        <ScrollView nestedScrollEnabled>
          {online.length === 0 ? (
            <Text className="text-gray-500">No friends currently studying.</Text>
          ) : (
            online.map(friend => (
              <Pressable key={friend.id} onPress={() => router.push(`/users/${friend.id}`)} className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-200">
                <Image source={friend.avatar ? { uri: friend.avatar } : defaultProfilePicture} className="w-10 h-10 rounded-full mr-3" />
                <View>
                  <Text className="font-medium">{friend.name}</Text>
                  {cafeLocations[friend.id] && (
                    <Text className="text-sm text-[#473319]">📍 {cafeLocations[friend.id].name}</Text>
                  )}
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>

      <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4 mb-6">
        <View className="flex-row items-center mb-2">
          <Image source={iconOffline} className="w-9 h-9 mr-2" />
          <Text className="text-lg font-semibold text-[#473319]">Not Studying</Text>
        </View>
        <ScrollView nestedScrollEnabled>
          {offline.length === 0 ? (
            <Text className="text-gray-500">Everyone is currently studying!</Text>
          ) : (
            offline.map(friend => (
              <Pressable key={friend.id} onPress={() => router.push(`/users/${friend.id}`)} className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-100">
                <Image source={friend.avatar ? { uri: friend.avatar } : defaultProfilePicture} className="w-10 h-10 rounded-full mr-3" />
                <Text className="font-medium">{friend.name}</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>

      {/* Sent Requests Section */}
      {sentRequests.length > 0 && (
        <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4">
          <View className="flex-row items-center mb-2">
            <Image source={iconRequests} className="w-12 h-12 mr-2" />
            <Text className="text-lg font-semibold text-[#473319]">Sent Requests</Text>
          </View>
          <ScrollView className="max-h-72" nestedScrollEnabled>
            {sentRequests.map(request => (
              <View key={request.id} className="flex-row items-center justify-between mb-3 p-2 rounded-lg border border-gray-200">
                <View className="flex-row items-center">
                  <Image source={request.toUser?.avatar ? { uri: request.toUser.avatar } : defaultProfilePicture} className="w-10 h-10 rounded-full mr-3" />
                  <Text className="font-medium">{request.toUser?.name}</Text>
                </View>
                <Pressable 
                  onPress={() => handleCancelRequest(request.id, request.toUser?.id || '')} 
                  className="px-3 py-1 bg-gray-400 rounded-full"
                >
                  <Text className="text-white text-sm">Cancel Request</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Modal visible={showAddModal} animationType="slide">
        <ScrollView className="flex-1 bg-white px-4 pt-12">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold">Add a Friend</Text>
            <Pressable onPress={() => setShowAddModal(false)} className="px-3 py-1 bg-gray-200 rounded-full">
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
            potentialFriends.map(user => {
              const requestState = requestStates[user.id] || 'none';
              return (
                <Pressable key={user.id} className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-200">
                  <Image source={user.avatar ? { uri: user.avatar } : defaultProfilePicture} className="w-10 h-10 rounded-full mr-3" />
                  <View className="flex-1">
                    <Text className="font-medium">{user.name}</Text>
                  </View>
                  {requestState === 'none' ? (
                    <Pressable onPress={() => handleSendRequest(user.id)} className="px-3 py-1 bg-blue-600 rounded-full">
                      <Text className="text-white text-sm">Send Request</Text>
                    </Pressable>
                  ) : requestState === 'sent' ? (
                    <Pressable 
                      onPress={() => {
                        const request = sentRequests.find(r => r.toUser?.id === user.id);
                        if (request) {
                          handleCancelRequest(request.id, user.id);
                        }
                      }} 
                      className="px-3 py-1 bg-gray-400 rounded-full"
                    >
                      <Text className="text-white text-sm">Request Sent</Text>
                    </Pressable>
                  ) : (
                    <Pressable className="px-3 py-1 bg-gray-400 rounded-full">
                      <Text className="text-white text-sm">Request Pending</Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })
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