import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

export default app; 