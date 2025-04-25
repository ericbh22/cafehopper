import * as SQLite from 'expo-sqlite';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

let sqliteDb: SQLite.SQLiteDatabase | null = null;

export interface Cafe {
    id: number;
    name: string;
    address: string;
    area: string;
    latitude: number;
    longitude: number;
    hours: string;
    image: string;
    images: string;
    indoor_seating: number | null;
    outdoor_seating: number | null;
    public_users: number;
    industry: string;
    tags: string;
}

interface User {
    id: string;
    name: string;
    location?: string;
    avatar?: string;
    friends?: string[];
}

interface Review {
    id: string;
    cafeId: string;
    userId: string;
    comment: string;
    ratings: any;
    timestamp: Date;
}

// Initialize SQLite
export const initDatabase = async () => {
    try {
      if (!sqliteDb) {
        const dbAsset = Asset.fromModule(require('../assets/cafes.db'));
        await dbAsset.downloadAsync();
  
        const dbPath = `${FileSystem.documentDirectory}SQLite/cafes.db`;
  
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        if (!fileInfo.exists) {
          // Copy only if not already there
          await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });
          await FileSystem.copyAsync({
            from: dbAsset.localUri!,
            to: dbPath,
          });
        }
  
        console.log('Opening database at:', dbPath);
        sqliteDb = await SQLite.openDatabaseAsync('cafes.db');
        console.log('Database initialized successfully');

        // Update Hikari Life images
        await sqliteDb.runAsync(
          'UPDATE cafes SET image = ?, images = ? WHERE id = ?',
          [
            'https://kurasu.kyoto/cdn/shop/articles/DSC08705-1036c2f8-43c9-4596-a0c1-dca7dc27a419-2_1600x.jpg?v=1646708315',
            '["https://kurasu.kyoto/cdn/shop/articles/DSC08705-1036c2f8-43c9-4596-a0c1-dca7dc27a419-2_1600x.jpg?v=1646708315"]',
            20145
          ]
        );
        console.log('Updated Hikari Life images');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  };
  
// Cafe operations
export const getCafes = async (): Promise<Cafe[]> => {
    if (!sqliteDb) await initDatabase();
    if (!sqliteDb) throw new Error('Database not initialized');
    const result = await sqliteDb.getAllAsync('SELECT * FROM cafes');
    return result as Cafe[];
};

export const getCafeById = async (id: number): Promise<Cafe | null> => {
    if (!sqliteDb) await initDatabase();
    if (!sqliteDb) throw new Error('Database not initialized');
    console.log('Querying cafe with ID:', id);
    const result = await sqliteDb.getFirstAsync('SELECT * FROM cafes WHERE id = ?', [id]);
    console.log('Query result:', result);
    return result as Cafe | null;
};

// Review operations
export const getReviewsForCafe = async (cafeId: number | string) => {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('cafeId', '==', cafeId.toString()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addReview = async (cafeId: number | string, userId: string, comment: string, ratings: any) => {
    const reviewsRef = collection(db, 'reviews');
    await addDoc(reviewsRef, {
        cafeId: cafeId.toString(),
        userId,
        comment,
        ratings,
        timestamp: new Date()
    });
};

// User operations
export const getUserById = async (userId: string): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (!data.name) {
                console.error('User document missing required name field');
                return null;
            }
            return { id: userId, name: data.name, ...data };
        }
        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

export const updateUserLocation = async (userId: string, cafeId: string | null) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            location: cafeId
        });
        return true;
    } catch (error) {
        console.error('Error updating user location:', error);
        return false;
    }
};

export const getFriends = async (userId: string) => {
    try {
        const user = await getUserById(userId);
        if (!user || !('friends' in user)) return [];
        
        const friends = user.friends as string[];
        const friendsPromises = friends.map(async (friendId: string) => {
            return await getUserById(friendId);
        });
        return (await Promise.all(friendsPromises)).filter(Boolean);
    } catch (error) {
        console.error('Error getting friends:', error);
        return [];
    }
};

// Review operations
export const getReviewsByCafeId = async (cafeId: number | string) => {
    try {
        const reviewsQuery = query(
            collection(db, 'reviews'),
            where('cafeId', '==', cafeId.toString())
        );
        const querySnapshot = await getDocs(reviewsQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting reviews:', error);
        return [];
    }
};

export const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
    try {
        const reviewsQuery = query(
            collection(db, 'reviews'),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(reviewsQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            cafeId: doc.data().cafeId,
            userId: doc.data().userId,
            comment: doc.data().comment,
            ratings: doc.data().ratings,
            timestamp: doc.data().timestamp
        }));
    } catch (error) {
        console.error('Error getting user reviews:', error);
        return [];
    }
};

export const updateUserFriends = async (userId: string, friends: string[]) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            friends: friends
        });
        return true;
    } catch (error) {
        console.error('Error updating user friends:', error);
        return false;
    }
}; 