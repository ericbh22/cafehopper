import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cafehopper_credentials';

export interface StoredCredentials {
  username: string;
  password: string;
}

export const storeCredentials = async (username: string, password: string) => {
  try {
    const credentials: StoredCredentials = { username, password };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Error storing credentials:', error);
  }
};

export const getStoredCredentials = async (): Promise<StoredCredentials | null> => {
  try {
    const credentials = await AsyncStorage.getItem(STORAGE_KEY);
    return credentials ? JSON.parse(credentials) : null;
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return null;
  }
};

export const clearStoredCredentials = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing credentials:', error);
  }
}; 