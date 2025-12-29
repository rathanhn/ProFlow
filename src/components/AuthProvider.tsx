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

    // Check if we're in a standalone PWA environment
    const isStandalone = typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone);

    const isLoginPage = pathname === '/admin/login' || pathname === '/client-login' || pathname === '/creator/login' || pathname === '/';
    const isAdminPath = pathname.startsWith('/admin');
    const isClientPath = pathname.startsWith('/client');
    const isCreatorPath = pathname.startsWith('/creator');

    // 1. If LOGGED IN and on a login page -> Auto-forward to dashboard
    if (user && isLoginPage) {
      if (pathname === '/admin/login') {
        router.push('/admin');
      } else if (pathname === '/client-login') {
        router.push(`/client/${user.uid}`);
      } else if (pathname === '/creator/login') {
        router.push(`/creator/${user.uid}`);
      } else if (pathname === '/') {
        // On the very front page, if logged in, go to admin by default or try to guess
        router.push('/admin');
      }
      return;
    }

    // 2. If NOT LOGGED IN and on PROTECTED path -> Redirect to Login
    if (!user && !isLoginPage) {
      // Small delay to ensure auth state is truly settled. 
      // PWAs on cold start can sometimes take a moment to read from IndexedDB.
      const delay = isStandalone ? 1000 : 200;
      const timeout = setTimeout(() => {
        // One final check of the actual auth state
        if (!auth.currentUser && !isLoginPage) {
          if (isAdminPath) router.push('/admin/login');
          else if (isClientPath) router.push('/client-login');
          else if (isCreatorPath) router.push('/creator/login');
          else router.push('/');
        }
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [user, loading, pathname, router]);

  // Safer pattern: Don't render protected pages until we've checked the local session.
  // This prevents sub-components from triggering their own redirects or errors.
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground animate-pulse">Checking session...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
