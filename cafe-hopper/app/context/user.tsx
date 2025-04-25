import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserById } from '../database';
import { useAuth } from './AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface User {
    id: string;
    name: string;
    location: string | null;
    avatar?: string;
    friends?: string[];
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const defaultProfilePicture = require('../../assets/images/profile/default.png');

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user: authUser } = useAuth();

    const loadUser = async (retryCount = 0) => {
        if (!authUser) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Get the username from the email
            const username = authUser.email?.split('@')[0];
            if (!username) {
                throw new Error('Invalid username');
            }

            // Query Firestore to find the user document with matching username
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // If no user found and we haven't retried too many times, try again
                if (retryCount < 3) {
                    console.log(`User not found, retrying... (${retryCount + 1}/3)`);
                    setTimeout(() => loadUser(retryCount + 1), 1000);
                    return;
                }
                throw new Error('User not found');
            }

            // Get the first matching user document
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            
            setUser({
                id: userDoc.id,
                name: userData.name,
                location: userData.location || null,
                avatar: userData.avatar,
                friends: userData.friends
            });
        } catch (err) {
            setError('Failed to load user data');
            console.error('Error loading user:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, [authUser]);

    return (
        <UserContext.Provider value={{ user, loading, error, refreshUser: loadUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
 