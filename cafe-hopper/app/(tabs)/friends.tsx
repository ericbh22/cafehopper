import { ScrollView, View, Text, Image, Pressable, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserById, updateUserFriends, getCafeById } from '../database';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCafes } from '../context/cafes';
import { useUser } from '../context/user';
import SearchBar from '../components/searchbar';
const iconFriends = require('../../assets/images/friendsicon.png');
const iconOffline = require('../../assets/images/inactiveicon.png');

interface User {
  id: string;
  name: string;
  location?: string;
  avatar?: string;
  friends?: string[];
}

interface Cafe {
  id: string | number;
  name: string;
  address: string;
  area: string;
}

export default function FriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const { user, loading: userLoading, refreshUser } = useUser();
  const { cafes, loading: cafesLoading } = useCafes();
  const [friends, setFriends] = useState<User[]>([]);
  const [potentialFriends, setPotentialFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [cafeLocations, setCafeLocations] = useState<Record<string, Cafe>>({});

  useEffect(() => {
    loadFriends();
  }, [user]);

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
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (text: string) => {
    if (!text.trim()) return setPotentialFriends([]);

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('name', '>=', text), where('name', '<=', text + '\uf8ff'));
    const snap = await getDocs(q);
    const found = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
    const ids = new Set(friends.map(f => f.id));
    const results = found.filter(u => u.id !== user?.id && !ids.has(u.id));
    setPotentialFriends(results);
  };

  const addFriend = async (id: string) => {
    if (!user) return;
    const updated = [...(user.friends || []), id];
    await updateUserFriends(user.id, updated);
    await refreshUser();
    setShowAddModal(false);
    setAddQuery('');
    loadFriends();
  };

  if (userLoading || cafesLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) return <Text className="p-4">User not found</Text>;

  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const online = filteredFriends.filter(f => !!f.location);
  const offline = filteredFriends.filter(f => !f.location);

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">👥 Hoppers</Text>
        <Pressable onPress={() => setShowAddModal(true)} className="px-4 py-1 bg-[#473319] rounded-full">
          <Text className="text-white font-medium text-sm">Add</Text>
        </Pressable>
      </View>

      <View className="flex-1">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search Hoppers..." />
      </View>

      <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4 mb-6">
        <View className="flex-row items-center mb-2">
          <Image source={iconFriends} className="w-12 h-12 mr-2" />
          <Text className="text-lg font-semibold text-[#473319]">Studying Now</Text>
        </View>
        <ScrollView className="max-h-72" nestedScrollEnabled>
          {online.length === 0 ? (
            <Text className="text-gray-500">No friends currently studying.</Text>
          ) : (
            online.map(friend => (
              <Pressable key={friend.id} onPress={() => router.push(`/users/${friend.id}`)} className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-200">
                <Image source={{ uri: friend.avatar || 'https://i.pravatar.cc/150' }} className="w-10 h-10 rounded-full mr-3" />
                <View>
                  <Text className="font-medium">{friend.name}</Text>
                  {cafeLocations[friend.id] && (
                    <Text className="text-sm text-blue-600">📍 {cafeLocations[friend.id].name}</Text>
                  )}
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>

      <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4">
        <View className="flex-row items-center mb-2">
          <Image source={iconOffline} className="w-9 h-9 mr-2" />
          <Text className="text-lg font-semibold text-[#473319]">Not Studying</Text>
        </View>
        <ScrollView className="max-h-72" nestedScrollEnabled>
          {offline.length === 0 ? (
            <Text className="text-gray-500">Everyone is currently studying!</Text>
          ) : (
            offline.map(friend => (
              <Pressable key={friend.id} onPress={() => router.push(`/users/${friend.id}`)} className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-100">
                <Image source={{ uri: friend.avatar || 'https://i.pravatar.cc/150' }} className="w-10 h-10 rounded-full mr-3" />
                <Text className="font-medium">{friend.name}</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>

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
            potentialFriends.map(user => (
              <Pressable key={user.id} onPress={() => addFriend(user.id)} className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-200">
                <Image source={{ uri: user.avatar || 'https://i.pravatar.cc/150' }} className="w-10 h-10 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="font-medium">{user.name}</Text>
                </View>
                <Pressable onPress={() => addFriend(user.id)} className="px-3 py-1 bg-blue-600 rounded-full">
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