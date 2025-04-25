import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-[#f7dbb2] border-2 border-[#473319] rounded-full px-5 py-3 mb-4">
      <Ionicons name="search" size={20} color="#473319" style={{ marginRight: 8 }} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#795f3e"
        className="flex-1 text-base text-[#473319]"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}
