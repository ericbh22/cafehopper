import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
      <Ionicons name="search" size={20} color="gray" style={{ marginRight: 8 }} />
      <TextInput
        placeholder="Search cafes..."
        value={value}
        onChangeText={onChange}
        className="flex-1 text-base text-gray-700"
      />
    </View>
  );
}
