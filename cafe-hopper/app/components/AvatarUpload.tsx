import React, { useState } from 'react';
import { View, Text, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';
import { defaultProfilePicture } from '../context/user';

interface AvatarUploadProps {
    currentAvatar?: string;
    userId: string;
    onAvatarUpdate: (newAvatar: string) => void;
}

export default function AvatarUpload({ currentAvatar, userId, onAvatarUpdate }: AvatarUploadProps) {
    const [loading, setLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setLoading(true);
            
            // Convert URI to blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create a unique filename
            const filename = `avatars/${userId}_${Date.now()}.jpg`;
            const storageRef = ref(storage, filename);

            // Upload the image
            await uploadBytes(storageRef, blob);

            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef);

            // Update user document in Firestore
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                avatar: downloadURL
            });

            onAvatarUpdate(downloadURL);
            setShowOptions(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlInput = async () => {
        Alert.prompt(
            'Enter Image URL',
            'Please enter a valid image URL',
            async (url) => {
                if (url) {
                    try {
                        // Validate URL
                        const response = await fetch(url);
                        if (!response.ok) throw new Error('Invalid URL');
                        
                        // Update user document in Firestore
                        const userRef = doc(db, 'users', userId);
                        await updateDoc(userRef, {
                            avatar: url
                        });

                        onAvatarUpdate(url);
                        setShowOptions(false);
                    } catch (error) {
                        Alert.alert('Error', 'Invalid image URL');
                    }
                }
            }
        );
    };

    return (
        <View className="relative">
            <Pressable onPress={() => setShowOptions(true)}>
                <Image
                    source={currentAvatar ? { uri: currentAvatar } : defaultProfilePicture}
                    className="w-24 h-24 rounded-full"
                />
                {loading && (
                    <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
                        <ActivityIndicator color="white" />
                    </View>
                )}
            </Pressable>

            {showOptions && (
                <View className="absolute top-0 left-0 right-0 bg-white rounded-lg shadow-lg p-4 z-10 w-48">
                    <Pressable
                        onPress={pickImage}
                        className="py-3"
                    >
                        <Text className="text-center text-[#473319] font-medium">Upload Photo</Text>
                    </Pressable>
                    <Pressable
                        onPress={handleUrlInput}
                        className="py-3"
                    >
                        <Text className="text-center text-[#473319] font-medium">Enter URL</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setShowOptions(false)}
                        className="py-3"
                    >
                        <Text className="text-center text-red-500 font-medium">Cancel</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
} 