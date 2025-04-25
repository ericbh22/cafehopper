import { ScrollView, View, Text, Image, Pressable, TextInput, Modal } from 'react-native';
import { users } from '../data/user';
import { cafes } from '../data/data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { getCurrentUser } from '../context/currentUser';
import SearchBar from '../components/searchbar';
const iconFriends = require('../../assets/images/iconfriends.png');
const iconOffline = require('../../assets/images/offlineicon.png');
export default function FriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addQuery, setAddQuery] = useState('');

  const currentUser = getCurrentUser(users);
  if (!currentUser) return <Text className="p-4">User not found</Text>;

  const currentUserFriends = currentUser.friends ?? [];

  const friendUsers = users.filter((user) => currentUserFriends.includes(user.id));
  const onlineFriends = friendUsers.filter((user) => !!user.location && user.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const offlineFriends = friendUsers.filter((user) => !user.location && user.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const possibleAdds = users.filter(
    (u) =>
      u.id !== currentUser.id &&
      !currentUserFriends.includes(u.id) &&
      u.name.toLowerCase().includes(addQuery.toLowerCase())
  );

  const addFriend = (userId: string) => {
    if (!currentUser.friends) currentUser.friends = [];
    currentUser.friends.push(userId);
    setShowAddModal(false);
    setAddQuery('');
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-12">
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
      <View className="flex-1">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder = {"Search Hoppers..."}/>
      </View>

      {/* Add Friend Modal */}
      <Modal visible={showAddModal} animationType="slide">
        <ScrollView className="flex-1 bg-white px-4 pt-12">
          <Text className="text-xl font-semibold mb-4">Add a Friend</Text>
          <TextInput
            placeholder="Search users..."
            value={addQuery}
            onChangeText={setAddQuery}
            className="bg-gray-100 rounded-full px-4 py-2 mb-4 text-base text-gray-700"
          />
          {possibleAdds.length === 0 ? (
            <Text className="text-gray-500">No users found.</Text>
          ) : (
            possibleAdds.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => addFriend(user.id)}
                className="flex-row items-center justify-between mb-3 p-2 rounded-lg border border-gray-200"
              >
                <View className="flex-row items-center">
                  <Image source={{ uri: user.avatar }} className="w-15 h-15 rounded-full mr-3" />
                  <Text className="font-medium">{user.name}</Text>
                </View>
                <Text className="text-sm text-blue-600">Add</Text>
              </Pressable>
            ))
          )}
          <Pressable
            onPress={() => setShowAddModal(false)}
            className="mt-6 px-4 py-2 bg-gray-200 rounded-full"
          >
            <Text className="text-center text-sm">Close</Text>
          </Pressable>
        </ScrollView>
      </Modal>

      <View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4 mb-6">
  <View className="flex-row items-center mb-2">
    <Image source={iconFriends} className="w-12 h-12 mr-2" />
    <Text className="text-lg font-semibold text-[#473319]">Studying Now</Text>
  </View>
  <ScrollView className="max-h-72" nestedScrollEnabled>
    {onlineFriends.length === 0 ? (
      <Text className="text-gray-500">No friends currently studying.</Text>
    ) : (
      onlineFriends.map((user) => {
        const cafe = cafes.find((c) => c.id === user.location);
        return (
          <Pressable
            key={user.id}
            onPress={() => router.push(`/users/${user.id}`)}
            className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-200"
          >
            <Image source={{ uri: user.avatar }} className="w-10 h-10 rounded-full mr-3" />
            <View>
              <Text className="font-medium">{user.name}</Text>
              {cafe && <Text className="text-sm text-blue-600">📍 {cafe.name}</Text>}
            </View>
          </Pressable>
        );
      })
    )}
  </ScrollView>
</View>

{/* Offline Friends Container */}
<View className="border-2 rounded-xl border-[#473319] bg-[#f7dbb2]/20 p-4">
  <View className="flex-row items-center mb-2">
    <Image source={iconOffline} className="w-9 h-9 mr-2" />
    <Text className="text-lg font-semibold text-[#473319]">Not Studying</Text>
  </View>
  <ScrollView className="max-h-72" nestedScrollEnabled>
    {offlineFriends.length === 0 ? (
      <Text className="text-gray-500">Everyone is currently studying!</Text>
    ) : (
      offlineFriends.map((user) => (
        <Pressable
          key={user.id}
          onPress={() => router.push(`/users/${user.id}`)}
          className="flex-row items-center mb-3 p-2 rounded-lg border border-gray-100"
        >
          <Image source={{ uri: user.avatar }} className="w-10 h-10 rounded-full mr-3" />
          <Text className="font-medium">{user.name}</Text>
        </Pressable>
      ))
    )}
  </ScrollView>
</View>
</ScrollView>
  );
}
