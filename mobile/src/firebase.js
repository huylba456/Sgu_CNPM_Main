import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA6nUavgaS6RdWbnBEP47K6kz98aOg_k0M',
  authDomain: 'cnpm-eb8ca.firebaseapp.com',
  projectId: 'cnpm-eb8ca',
  storageBucket: 'cnpm-eb8ca.firebasestorage.app',
  messagingSenderId: '257791647638',
  appId: '1:257791647638:web:5bb9a27b7c92536a0c47b7',
  measurementId: 'G-3JYT7C0TJY'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
