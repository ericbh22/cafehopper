// src/hooks/useCafes.ts
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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
  
  console.log("DB instance exists:", !!db);
  
  useEffect(() => {
    console.log("Starting useEffect in useCafes");
    
    const fetchCafes = async () => {
      console.log("Starting fetchCafes function");
      
      try {
        console.log("About to call getDocs");
        const cafesRef = collection(db, 'cafes');
        console.log("Collection reference created:", !!cafesRef);
        
        const snapshot = await getDocs(cafesRef);
        console.log("getDocs completed, snapshot exists:", !!snapshot);
        
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Cafe[];
        
        console.log("Processed fetched cafes:", fetched);
        setCafes(fetched);
      } catch (error: any) {
        console.error('Failed to fetch cafes:', error.message, error);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };
    
    // Execute the function
    fetchCafes().catch(err => {
      console.error("Uncaught error in fetchCafes:", err);
      setLoading(false);
    });
    
    // Safety timeout
    const timeoutId = setTimeout(() => {
      console.log("Safety timeout reached after 10 seconds");
      setLoading(false);
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  console.log("useCafes hook returning. Loading:", loading, "Cafes count:", cafes.length);
  return { cafes, loading };
};