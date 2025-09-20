import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export type UserType = 'user' | 'artist';

export interface UserProfile {
  uid: string;
  email: string;
  userType: UserType;
  displayName?: string;
  phone?: string;
  craftType?: string;
  location?: {
    state: string;
    district: string;
    village: string;
  };
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userType: UserType, additionalInfo?: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: (userType: UserType) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, userType: UserType, additionalInfo: Partial<UserProfile> = {}) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const profile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        userType,
        displayName: result.user.displayName || additionalInfo.displayName || '',
        phone: additionalInfo.phone || '',
        craftType: additionalInfo.craftType || '',
        location: additionalInfo.location || { state: '', district: '', village: '' },
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', result.user.uid), profile);
      setUserProfile(profile);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error; // Re-throw to be handled by the component
    }
  }

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error; // Re-throw to be handled by the component
    }
  }

  async function loginWithGoogle(userType: UserType) {
    try {
      // Check if Google provider is properly configured
      if (!googleProvider) {
        throw new Error('Google authentication provider is not available. Please check your Firebase configuration.');
      }

      const result = await signInWithPopup(auth, googleProvider);
      
      if (!result || !result.user) {
        throw new Error('Google authentication failed - no user data received.');
      }
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create profile for new Google user
        const profile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          userType,
          displayName: result.user.displayName || '',
          phone: '',
          craftType: '',
          location: { state: '', district: '', village: '' },
          createdAt: new Date()
        };

        await setDoc(doc(db, 'users', result.user.uid), profile);
        setUserProfile(profile);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Enhance error messages for common Google auth issues
      if (error.code === 'auth/configuration-not-found' || error.message?.includes('configuration-not-found')) {
        throw new Error('Google authentication is not enabled in Firebase Console. Please enable Google sign-in method.');
      }
      
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google authentication. Please add it to Firebase authorized domains.');
      }
      
      if (error.code === 'auth/operation-not-supported-in-this-environment') {
        throw new Error('Google authentication is not supported in this environment. Please check your configuration.');
      }
      
      throw error; // Re-throw to be handled by the component
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!currentUser || !userProfile) return;

    const updatedProfile = { ...userProfile, ...data };
    await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
    setUserProfile(updatedProfile);
  }

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth initialization taking too long, proceeding anyway');
      setLoading(false);
    }, 5000); // 5 second timeout
    
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          clearTimeout(loadingTimeout); // Clear timeout since auth loaded
          setCurrentUser(user);
          
          if (user) {
            // Fetch user profile from Firestore with error handling
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
              }
            } catch (firestoreError) {
              console.error('Failed to fetch user profile:', firestoreError);
              // Continue with basic user info even if profile fetch fails
            }
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Auth state change error:', error);
          clearTimeout(loadingTimeout);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Failed to set up auth state listener:', error);
      clearTimeout(loadingTimeout);
      setLoading(false);
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth state:', error);
        }
      }
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Kala-Kaart...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}