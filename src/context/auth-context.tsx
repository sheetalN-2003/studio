
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { type User } from '@/ai/flows/user-auth-flow';
import { useFirebase } from '@/firebase/provider';
import { getDoc, doc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  // login is now handled by onAuthStateChanged
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth, firestore, isUserLoading, user: firebaseUser } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleAuthChange = async () => {
      if (isUserLoading) return; // Wait for firebase user state to be determined

      if (firebaseUser && firestore) {
        // User is logged in according to Firebase, now fetch our custom profile
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // Profile doesn't exist, maybe an error state?
          setUser(null);
        }
      } else {
        // No firebase user, so no app user
        setUser(null);
      }
      setIsLoading(false);
    };

    handleAuthChange();

  }, [firebaseUser, isUserLoading, firestore]);

  const logout = useCallback(async () => {
    if (auth) {
      await auth.signOut();
      setUser(null); // Clear local user state
      if (pathname !== '/login') {
        router.replace('/login');
      }
    }
  }, [auth, router, pathname]);

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
