'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Redirect based on current path type
      if (pathname.startsWith('/admin')) {
        router.push('/admin/login');
      } else if (pathname.startsWith('/client')) {
        router.push('/client-login');
      } else if (pathname.startsWith('/creator')) {
        router.push('/creator/login');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (loading) return;

    const isPublicPath = pathname === '/' || pathname === '/admin/login' || pathname === '/client-login' || pathname === '/creator/login';
    const isAdminPath = pathname.startsWith('/admin');
    const isClientPath = pathname.startsWith('/client');
    const isCreatorPath = pathname.startsWith('/creator');

    if (!user && !isPublicPath) {
      // If not logged in and trying to access protected route, redirect to home
      if (isAdminPath) router.push('/admin/login');
      else if (isClientPath) router.push('/client-login');
      else if (isCreatorPath) router.push('/creator/login');
      else router.push('/');
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
