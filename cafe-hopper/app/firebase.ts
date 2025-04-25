import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjrvq1N4BI5ZBSnvIe8BPRIaTmKi9lmFI",
  projectId: "cafe-hopper-81af9",
  storageBucket: "cafe-hopper-81af9.firebasestorage.app",
  messagingSenderId: "523351125895",
  appId: "1:523351125895:ios:65ed4cbd782705742c2d22"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app; 