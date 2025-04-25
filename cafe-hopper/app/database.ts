import * as SQLite from 'expo-sqlite';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
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
    location: string | null;
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
        await sqliteDb.runAsync(
            'UPDATE cafes SET image = ?, images = ? WHERE id = ?',
            [
              'https://imgix.theurbanlist.com/content/general/cheri_julian_lallo-11.jpg',
              '["https://imgix.theurbanlist.com/content/general/cheri_julian_lallo-11.jpg"]',
              1
            ]
          );
  
          await sqliteDb.runAsync(
            'UPDATE cafes SET image = ?, images = ? WHERE id = ?',
            [
              'https://cdn.qthotels.com/wp-content/uploads/sites/101/2019/08/16130840/Pascale-into-Bar-scaled.jpg',
              '["https://cdn.qthotels.com/wp-content/uploads/sites/101/2019/08/16130840/Pascale-into-Bar-scaled.jpg"]',
              2
            ]
          );
  
          await sqliteDb.runAsync(
            'UPDATE cafes SET image = ?, images = ? WHERE id = ?',
            [
              'https://whatson.melbourne.vic.gov.au/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6IjlhN2FhNjQ4LTFhMDktNGUzMC1hNWEwLWM4OGUzOTQ1ZWE0NSIsInB1ciI6ImJsb2JfaWQifX0=--4e365d1276a2cc736c048c205885f663ca667bc3/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fbGltaXQiOlsxMDAwLDYwMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0=--0d1dec94e96bf59e4e90ca4a7c11e516560ab297/efab83a6-656b-4985-9fa2-24d94bb9d075.jpg',
              '["https://whatson.melbourne.vic.gov.au/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6IjlhN2FhNjQ4LTFhMDktNGUzMC1hNWEwLWM4OGUzOTQ1ZWE0NSIsInB1ciI6ImJsb2JfaWQifX0=--4e365d1276a2cc736c048c205885f663ca667bc3/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fbGltaXQiOlsxMDAwLDYwMF19LCJwdXIiOiJ2YXJpYXRpb24ifX0=--0d1dec94e96bf59e4e90ca4a7c11e516560ab297/efab83a6-656b-4985-9fa2-24d94bb9d075.jpg"]',
              3
            ]
          );

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
    const result = await sqliteDb.getFirstAsync('SELECT * FROM cafes WHERE id = ?', [id]);
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
            return { 
                id: userId, 
                name: data.name, 
                location: data.location || null,
                avatar: data.avatar,
                friends: data.friends
            };
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

// Friend request operations
export const checkExistingRequest = async (fromUserId: string, toUserId: string) => {
    try {
        const requestsRef = collection(db, 'friendRequests');
        const q = query(
            requestsRef,
            where('fromUserId', '==', fromUserId),
            where('toUserId', '==', toUserId),
            where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking existing request:', error);
        return false;
    }
};

export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
    try {
        // Check if request already exists
        const exists = await checkExistingRequest(fromUserId, toUserId);
        if (exists) return false;

        const friendRequestRef = doc(collection(db, 'friendRequests'));
        await setDoc(friendRequestRef, {
            fromUserId,
            toUserId,
            status: 'pending',
            createdAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error sending friend request:', error);
        return false;
    }
};

export const cancelFriendRequest = async (requestId: string) => {
    try {
        await deleteDoc(doc(db, 'friendRequests', requestId));
        return true;
    } catch (error) {
        console.error('Error canceling friend request:', error);
        return false;
    }
};

export const acceptFriendRequest = async (requestId: string) => {
    try {
        const requestRef = doc(db, 'friendRequests', requestId);
        const requestDoc = await getDoc(requestRef);
        
        if (!requestDoc.exists()) return false;
        
        const request = requestDoc.data();
        const fromUserId = request.fromUserId;
        const toUserId = request.toUserId;
        
        // Update both users' friends lists
        const fromUser = await getUserById(fromUserId);
        const toUser = await getUserById(toUserId);
        
        if (!fromUser || !toUser) return false;
        
        // Create new friends arrays with the new friend
        const fromUserFriends = [...new Set([...(fromUser.friends || []), toUserId])];
        const toUserFriends = [...new Set([...(toUser.friends || []), fromUserId])];
        
        // Update both users' friends lists in parallel
        await Promise.all([
            updateUserFriends(fromUserId, fromUserFriends),
            updateUserFriends(toUserId, toUserFriends)
        ]);
        
        // Delete the friend request
        await deleteDoc(requestRef);
        
        return true;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return false;
    }
};

export const getFriendRequests = async (userId: string) => {
    try {
        const requestsRef = collection(db, 'friendRequests');
        const q = query(
            requestsRef,
            where('toUserId', '==', userId),
            where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        
        const requests = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const fromUser = await getUserById(data.fromUserId);
                return {
                    id: doc.id,
                    fromUser,
                    toUser: null,
                    createdAt: data.createdAt.toDate()
                };
            })
        );
        
        return requests;
    } catch (error) {
        console.error('Error getting friend requests:', error);
        return [];
    }
};

export const getSentFriendRequests = async (userId: string) => {
    try {
        const requestsRef = collection(db, 'friendRequests');
        const q = query(
            requestsRef,
            where('fromUserId', '==', userId),
            where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        
        const requests = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const toUser = await getUserById(data.toUserId);
                return {
                    id: doc.id,
                    fromUser: null,
                    toUser,
                    createdAt: data.createdAt.toDate()
                };
            })
        );
        
        return requests;
    } catch (error) {
        console.error('Error getting sent friend requests:', error);
        return [];
    }
};

export const removeFriend = async (userId: string, friendId: string) => {
    try {
        const user = await getUserById(userId);
        const friend = await getUserById(friendId);
        
        if (!user || !friend) return false;
        
        // Remove friend from user's friends list
        const userFriends = user.friends?.filter(id => id !== friendId) || [];
        await updateUserFriends(userId, userFriends);
        
        // Remove user from friend's friends list
        const friendFriends = friend.friends?.filter(id => id !== userId) || [];
        await updateUserFriends(friendId, friendFriends);
        
        return true;
    } catch (error) {
        console.error('Error removing friend:', error);
        return false;
    }
}; 