'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from '@/lib/firebase';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { PostgreSQLService } from '@/lib/postgresql';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to generate unique user codes
const generateUserCode = async (role: UserRole): Promise<string> => {
  const prefix = role === 'admin' ? 'AD' : role === 'business' ? 'BA' : 'CA';
  const length = role === 'admin' ? 6 : 5;
  
  // This is a simplified version - in production, you'd want to check against existing codes
  const randomNum = Math.floor(Math.random() * Math.pow(10, length));
  return `${prefix}${randomNum.toString().padStart(length, '0')}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user data from PostgreSQL
  const refreshUserData = async (firebaseUser: FirebaseUser) => {
    try {
      // First, sync the user to PostgreSQL
      await PostgreSQLService.syncCurrentUser(firebaseUser);
      
      // Get the updated user data from PostgreSQL
      const postgresUser = await PostgreSQLService.getUser(firebaseUser.uid);
      
      if (postgresUser) {
        // Check if user has an approved business and update role accordingly
        const business = await PostgreSQLService.getBusinessByUserId(firebaseUser.uid);
        if (business && postgresUser.role !== 'business') {
          // Update the user's role to business
          await PostgreSQLService.updateUser(firebaseUser.uid, { role: 'business' });
          postgresUser.role = 'business';
        }
        
        return postgresUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user authenticated:', firebaseUser.uid);
          
          // Get user data from PostgreSQL (which includes the latest role)
          const postgresUser = await refreshUserData(firebaseUser);
          
          if (postgresUser) {
            const userStateData: any = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || postgresUser.display_name,
              photoURL: firebaseUser.photoURL || postgresUser.photo_url,
              phoneNumber: firebaseUser.phoneNumber || postgresUser.phone_number,
              role: postgresUser.role,
              userCode: postgresUser.user_code,
              isEmailVerified: firebaseUser.emailVerified,
              createdAt: postgresUser.created_at,
            };
            
            // Only include businessProfile if it exists
            if (postgresUser.business_profile) {
              userStateData.businessProfile = postgresUser.business_profile;
            }
            
            console.log('Setting user state with data:', userStateData);
            setUser(userStateData);
          } else {
            // Fallback to Firestore if PostgreSQL fails
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('User data from Firestore:', userData);
              const userStateData: any = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || userData.displayName,
                photoURL: firebaseUser.photoURL || userData.photoURL,
                phoneNumber: firebaseUser.phoneNumber || userData.phoneNumber,
                role: userData.role,
                userCode: userData.userCode,
                isEmailVerified: firebaseUser.emailVerified,
                createdAt: userData.createdAt.toDate(),
              };
              
              if (userData.businessProfile) {
                userStateData.businessProfile = userData.businessProfile;
              }
              
              setUser(userStateData);
            } else {
              console.log('User document does not exist in Firestore');
              setUser(null);
            }
          }
        } else {
          console.log('No Firebase user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in result:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        phoneNumber: result.user.phoneNumber
      });
      
      console.log('Raw Firebase user photoURL:', result.user.photoURL);
      console.log('Raw Firebase user displayName:', result.user.displayName);
      
      // Check if user exists in Firestore, if not create them
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        const userCode = await generateUserCode('customer');
        const userDataToSave = {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          phoneNumber: result.user.phoneNumber,
          role: 'customer',
          userCode,
          isEmailVerified: result.user.emailVerified,
          createdAt: serverTimestamp()
        };
        
        console.log('Saving new user data to Firestore:', userDataToSave);
        await setDoc(doc(db, 'users', result.user.uid), userDataToSave);
      } else {
        // Update existing user's profile data with latest Google info
        const updateData: any = {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          phoneNumber: result.user.phoneNumber,
          isEmailVerified: result.user.emailVerified,
          // Keep existing role, userCode, and other data
          role: userDoc.data().role,
          userCode: userDoc.data().userCode,
          createdAt: userDoc.data().createdAt,
        };
        
        // Only include businessProfile if it exists
        if (userDoc.data().businessProfile) {
          updateData.businessProfile = userDoc.data().businessProfile;
        }
        
        console.log('Updating existing user data in Firestore:', updateData);
        await setDoc(doc(db, 'users', result.user.uid), updateData, { merge: true });
      }
    } catch (error) {
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      // Check if user exists in Firestore, if not create them
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        const userCode = await generateUserCode('customer');
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          phoneNumber: result.user.phoneNumber,
          role: 'customer',
          userCode,
          isEmailVerified: result.user.emailVerified,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log('Creating user with email:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', result.user.uid);
      
      const userCode = await generateUserCode('customer');
      console.log('Generated user code:', userCode);
      
      const userData = {
        email,
        displayName,
        role: 'customer',
        userCode,
        isEmailVerified: false,
        createdAt: serverTimestamp()
      };
      
      console.log('Saving user data to Firestore:', userData);
      await setDoc(doc(db, 'users', result.user.uid), userData);
      console.log('User data saved successfully');
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        console.log('Refreshing user data...');
        // First, sync the user to PostgreSQL
        await PostgreSQLService.syncCurrentUser(auth.currentUser);
        
        // Get the updated user data from PostgreSQL
        const postgresUser = await PostgreSQLService.getUser(auth.currentUser.uid);
        
        if (postgresUser) {
          // Check if user has an approved business and update role accordingly
          const business = await PostgreSQLService.getBusinessByUserId(auth.currentUser.uid);
          if (business && postgresUser.role !== 'business') {
            console.log('Updating user role to business...');
            // Update the user's role to business
            await PostgreSQLService.updateUser(auth.currentUser.uid, { role: 'business' });
            // Fetch the updated user data again
            const updatedPostgresUser = await PostgreSQLService.getUser(auth.currentUser.uid);
            if (updatedPostgresUser) {
              postgresUser.role = updatedPostgresUser.role;
              console.log('User role updated to:', updatedPostgresUser.role);
            }
          }
          
          const userStateData: any = {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email!,
            displayName: auth.currentUser.displayName || postgresUser.display_name,
            photoURL: auth.currentUser.photoURL || postgresUser.photo_url,
            phoneNumber: auth.currentUser.phoneNumber || postgresUser.phone_number,
            role: postgresUser.role, // This should now be 'business' if updated
            userCode: postgresUser.user_code,
            isEmailVerified: auth.currentUser.emailVerified,
            createdAt: postgresUser.created_at,
          };
          
          if (postgresUser.business_profile) {
            userStateData.businessProfile = postgresUser.business_profile;
          }
          
          console.log('Refreshed user data:', userStateData);
          setUser(userStateData);
          
          // Force a re-render by updating the state again
          setTimeout(() => {
            console.log('Forcing re-render with updated user data:', userStateData);
            setUser({ ...userStateData });
          }, 100);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signUp,
    signOut,
    resetPassword,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 