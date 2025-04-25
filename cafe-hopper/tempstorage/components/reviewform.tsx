import { View, Text, Pressable, TextInput, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { Review } from '../data/data';
import { Ionicons } from '@expo/vector-icons';
import StarRating from './starrating';
import { currentUserId } from '../context/currentUser';
interface ReviewFormProps {
  onSubmit: (review: Review) => void;
}


const criteriaList = ['ambience', 'service', 'sound', 'drinks'] as const;
type Criteria = typeof criteriaList[number];

const initialRatings: Record<Criteria, number> = {
  ambience: 0,
  service: 0,
  sound: 0,
  drinks: 0,
};

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRatings);
  const [comment, setComment] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleSubmit = () => {
    onSubmit({ userId: currentUserId , comment, ratings: rating });
    setRating(initialRatings);
    setComment('');
    setCurrentIndex(0);
  };

  const currentCriteria = criteriaList[currentIndex];

  const animateTransition = (nextIndex: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(nextIndex);
    });
  };

  return (
    <View className="mt-2">
      {/* Category Slider */}
      <Animated.View
        className="border rounded-xl p-4 bg-gray-50"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Pressable
            disabled={currentIndex === 0}
            onPress={() => animateTransition(currentIndex - 1)}
            className="p-1"
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentIndex === 0 ? 'lightgray' : 'black'}
            />
          </Pressable>

          <Text className="text-sm font-semibold capitalize">{currentCriteria}</Text>

          <Pressable
            disabled={currentIndex === criteriaList.length - 1}
            onPress={() => animateTransition(currentIndex + 1)}
            className="p-1"
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentIndex === criteriaList.length - 1 ? 'lightgray' : 'black'}
            />
          </Pressable>
        </View>

        <View className="items-center">
          <StarRating
            iconSet="md-star"
            value={rating[currentCriteria]}
            onChange={(val) => setRating({ ...rating, [currentCriteria]: val })}
          />
        </View>
      </Animated.View>

      {/* Textbox + Submit (outside container) */}
      <TextInput
        placeholder="Leave a comment..."
        multiline
        className="border border-gray-300 rounded-lg p-2 text-sm mt-3"
        value={comment}
        onChangeText={setComment}
      />
      <Pressable
        onPress={handleSubmit}
        className="bg-blue-600 py-2 px-4 rounded-lg mt-2"
      >
        <Text className="text-white font-semibold text-center">Submit Review</Text>
      </Pressable>
    </View>
  );
}
