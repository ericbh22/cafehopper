import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCafes } from '../database';

interface Cafe {
  id: string;
  name: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  image?: string;
  reviews?: any[];
}

interface CafesContextType {
  cafes: Cafe[];
  loading: boolean;
  error: string | null;
  refreshCafes: () => Promise<void>;
}

const CafesContext = createContext<CafesContextType | undefined>(undefined);

export function CafesProvider({ children }: { children: ReactNode }) {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCafes = async () => {
    try {
      setLoading(true);
      const cafeData = await getCafes();
      console.log('Loaded cafes:', cafeData.length);
      setCafes(cafeData);
      setError(null);
    } catch (err) {
      console.error('Error loading cafes:', err);
      setError('Failed to load cafes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCafes();
  }, []);

  return (
    <CafesContext.Provider value={{ cafes, loading, error, refreshCafes: loadCafes }}>
      {children}
    </CafesContext.Provider>
  );
}

export function useCafes() {
  const context = useContext(CafesContext);
  if (context === undefined) {
    throw new Error('useCafes must be used within a CafesProvider');
  }
  return context;
} 