
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { type User } from '@/ai/flows/user-auth-flow';
import { useFirebase } from '@/firebase/provider';
import { getDoc, doc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
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
      if (isUserLoading) return;

      if (firebaseUser && firestore) {
        try {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as Omit<User, 'id'>;

              // Check for account status
              if (userData.role === 'Doctor' && userData.status !== 'approved') {
                 if (auth) await auth.signOut(); // Force sign out if not approved
                 setUser(null);
              } else {
                 setUser({ id: userDoc.id, ...userData });
              }
            } else {
              if (auth) await auth.signOut(); // Profile doesn't exist, sign out
              setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            if (auth) await auth.signOut();
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    handleAuthChange();

  }, [firebaseUser, isUserLoading, firestore, auth]);

  const logout = useCallback(async () => {
    if (auth) {
      await auth.signOut();
      setUser(null);
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
