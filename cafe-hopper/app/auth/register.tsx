import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { doc, setDoc, collection, getDocs, query, orderBy, limit, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { router } from 'expo-router';
import { storeCredentials } from '../utils/storage';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6 && password.length <= 20;
  };

  const generateUserId = async (): Promise<string> => {
    try {
      // Get all users ordered by ID in descending order
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('id', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If no users exist, start with u1
        return 'u1';
      }

      // Get the highest existing user ID
      const lastUser = querySnapshot.docs[0];
      const lastUserId = lastUser.data().id;
      const lastNumber = parseInt(lastUserId.substring(1));
      
      // Generate new ID by incrementing the number
      return `u${lastNumber + 1}`;
    } catch (error) {
      console.error('Error generating user ID:', error);
      // If there's an error, try to get the last document ID as fallback
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('__name__', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return 'u1';
        }
        
        const lastDoc = querySnapshot.docs[0];
        const lastDocId = lastDoc.id;
        const lastNumber = parseInt(lastDocId.substring(1));
        return `u${lastNumber + 1}`;
      } catch (fallbackError) {
        console.error('Error in fallback ID generation:', fallbackError);
        throw error;
      }
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert('Error', 'Username must be 4-20 characters long and can only contain letters, numbers, and underscores');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be 6-20 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // Generate a new user ID
      const userId = await generateUserId();

      // Firebase uses email/password authentication, so we'll use username@cafehopper.com as the email
      const email = `${username}@cafehopper.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create a user document in Firestore with the generated ID
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        id: userId,
        username,
        name: username, // Using username as the display name
        createdAt: new Date(),
        location: null,
        friends: [],
        avatar: null
      });

      // Wait for the document to be created and verify it exists
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('Failed to create user document');
      }

      // Store credentials if Remember Me is checked
      if (rememberMe) {
        await storeCredentials(username, password);
      }

      // Only redirect after confirming the document exists
      router.replace('/');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Username is already taken');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username (4-20 characters)"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (6-20 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <View style={styles.rememberMeContainer}>
        <Text style={styles.rememberMeText}>Remember Me</Text>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={rememberMe ? '#007AFF' : '#f4f3f4'}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  rememberMeText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
  },
}); 