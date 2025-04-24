// app/cafe/[id].tsx
import { View, Text, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function CafeDetailsScreen() {
  const { id } = useLocalSearchParams(); // e.g., cafe ID
  const mockCafe = {
    name: "The Study Spot",
    location: "123 Library Lane",
    hours: "8am – 6pm",
    images: [
      "https://source.unsplash.com/800x600/?cafe,1",
      "https://source.unsplash.com/800x600/?coffee,2",
    ],
    reviews: [
      { user: "Alice", comment: "Great ambience and wifi!" },
      { user: "Bob", comment: "Quiet and perfect for deep work." }
    ],
    friendsHere: ["Charlie", "Dana"],
    publicUsers: 5,
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-8">
      <Text className="text-2xl font-bold mb-2">{mockCafe.name}</Text>
      <Text className="text-gray-500 mb-2">{mockCafe.location}</Text>
      <Text className="text-gray-400 mb-4">Open: {mockCafe.hours}</Text>

      <ScrollView horizontal className="mb-4 space-x-2">
        {mockCafe.images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img }}
            className="w-60 h-36 rounded-xl"
          />
        ))}
      </ScrollView>

      <Text className="text-lg font-semibold mb-2">Reviews</Text>
      {mockCafe.reviews.map((review, idx) => (
        <View key={idx} className="mb-3 p-3 bg-gray-100 rounded-lg">
          <Text className="font-bold">{review.user}</Text>
          <Text>{review.comment}</Text>
        </View>
      ))}

      <Text className="text-lg font-semibold mt-4">Who's here now</Text>
      <Text className="mb-1">👥 Friends: {mockCafe.friendsHere.join(', ')}</Text>
      <Text className="text-gray-500">Public users: {mockCafe.publicUsers}</Text>
    </ScrollView>
  );
}
