// src/hooks/useCafes.ts
import { useEffect, useState } from 'react';
import { getCafes } from '../database';

export interface Cafe {
  id: string;
  name: string;
  address?: string;
  area?: string;
  industry?: string;
  seating?: {
    indoor?: number;
    outdoor?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  tags?: string[];
  promo?: string[];
  image?: string;
  distance?: string;
}

export const useCafes = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const fetched = await getCafes();
        setCafes(fetched);
      } catch (error: any) {
        console.error('Failed to fetch cafes:', error.message, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCafes();
  }, []);
  
  return { cafes, loading };
};