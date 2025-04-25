import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserById } from '../database';

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

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUser = async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await getUserById('u1');
            setUser(userData);
        } catch (err) {
            setError('Failed to load user data');
            console.error('Error loading user:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

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
 