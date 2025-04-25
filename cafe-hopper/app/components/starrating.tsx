
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


interface StarRatingProps {
    value: number;
    onChange: (val: number) => void;
    iconSet?: 'star' | 'md-star' | 'ios-star'; // optional prop
  }
  
  export default function StarRating({ value, onChange }: StarRatingProps) {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => onChange(star)}>
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={20}
              color="#facc15"
            />
          </Pressable>
        ))}
      </View>
    );
  }