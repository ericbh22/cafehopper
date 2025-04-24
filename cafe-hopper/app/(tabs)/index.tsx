import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const cafeId = 'abc123';
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Link href={{ pathname: "/cafe/[id]", params: { id: "123" } }}>
        <Pressable onPress={() => router.push(`/cafe/${cafeId}`)} className="p-4 bg-blue-100 rounded-xl">
          <Text className="text-lg font-semibold text-blue-700">Go to Cafe</Text>
        </Pressable>
      </Link>
    </View>
  );
}
