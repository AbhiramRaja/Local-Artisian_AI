import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDrsyYPS6Rei_QwOhUh4imDHcr8zFkWBCY",
  authDomain: "artisian-ai-9377c.firebaseapp.com",
  projectId: "artisian-ai-9377c",
  storageBucket: "artisian-ai-9377c.firebasestorage.app",
  messagingSenderId: "626183905123",
  appId: "1:626183905123:web:4c800567262f5a785c3d56",
  measurementId: "G-BN7EZ4HF9N"
};

// Validate Firebase configuration
const validateConfig = (config: typeof firebaseConfig): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  return requiredFields.every(field => config[field as keyof typeof config] && config[field as keyof typeof config].trim().length > 0);
};

if (!validateConfig(firebaseConfig)) {
  throw new Error('Firebase configuration is incomplete. Please check your Firebase project settings.');
}

// Initialize Firebase app
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase app:', error);
  throw new Error('Firebase initialization failed. Please check your configuration.');
}

// Initialize Firebase Auth with error handling
try {
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Auth:', error);
  throw new Error('Firebase Auth initialization failed.');
}

// Initialize Firestore with error handling
try {
  db = getFirestore(app);
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firestore:', error);
  throw new Error('Firestore initialization failed.');
}

// Initialize Google Auth Provider with proper scopes and error handling
let googleProvider: GoogleAuthProvider;
try {
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  console.log('Google Auth Provider initialized successfully');
} catch (error) {
  console.error('Failed to initialize Google Auth Provider:', error);
  // Create a basic provider without additional configuration as fallback
  googleProvider = new GoogleAuthProvider();
}

// Initialize Analytics only if supported and in production
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes && process.env.NODE_ENV === 'production') {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    }
  }).catch((error) => {
    console.warn('Firebase Analytics not supported:', error);
  });
}

// Export initialized services
export { auth, db, analytics, googleProvider };
export default app;