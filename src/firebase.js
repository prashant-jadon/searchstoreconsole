import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase initialization error:', error.stack);
  }
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Collection references
export const COLLECTIONS = {
  GAMES: 'games',
  TOOLS: 'tools',
  EDUCATION: 'education',
  BUSINESS: 'business'
};

// Firebase configuration validation
const validateFirebaseConfig = () => {
  const requiredKeys = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  const missingKeys = requiredKeys.filter(key => !process.env[key]);

  if (missingKeys.length > 0) {
    console.error('Missing Firebase configuration keys:', missingKeys);
    throw new Error('Missing Firebase configuration');
  }
};

// Validate configuration in development
if (process.env.NODE_ENV === 'development') {
  validateFirebaseConfig();
}

// Helper functions for Firestore operations
export const firestoreTimestamp = () => new Date().toISOString();

export const websiteCategories = Object.values(COLLECTIONS);

// Firebase error handler
export const handleFirebaseError = (error) => {
  console.error('Firebase operation failed:', error);
  
  // Map Firebase errors to user-friendly messages
  const errorMessages = {
    'auth/user-not-found': 'Invalid email or password',
    'auth/wrong-password': 'Invalid email or password',
    'auth/email-already-in-use': 'Email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak',
    // Add more error mappings as needed
  };

  return errorMessages[error.code] || 'An error occurred. Please try again.';
};

// Initialize Firebase Performance Monitoring in production
if (process.env.NODE_ENV === 'production') {
  import('firebase/performance').then(({ getPerformance }) => {
    try {
      getPerformance(app);
    } catch (error) {
      console.error('Error initializing performance monitoring:', error);
    }
  });
}

export default app;