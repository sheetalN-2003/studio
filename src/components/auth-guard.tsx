
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const publicPaths = ['/login', '/signup', '/register-hospital', '/forgot-password'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for authentication state to be determined
    }

    const pathIsPublic = publicPaths.some(path => pathname.startsWith(path));

    if (!user && !pathIsPublic) {
      router.push('/login');
    } else if (user && pathIsPublic) {
      // If user is logged in and tries to access public pages like login, redirect them.
      router.push('/');
    }
  }, [user, isLoading, router, pathname]);

  // Show loader while we're determining auth state or if we're about to redirect.
  if (isLoading || (!user && !publicPaths.some(path => pathname.startsWith(path)))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return <>{children}</>;
}
