import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-gray-200 rounded-full px-5 py-3 mb-4">
      <Ionicons name="search" size={20} color="gray" style={{ marginRight: 8 }} />
      <TextInput
        placeholder="Search cafes..."
        placeholderTextColor="#999"
        className="flex-1 text-base text-gray-800"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}
