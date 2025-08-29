
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { MainLayout } from './main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'Admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user.role !== 'Admin') {
     return (
        <MainLayout pageTitle="Unauthorized">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className='text-destructive'>Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Please contact your system administrator if you believe this is an error.</p>
                </CardContent>
            </Card>
        </MainLayout>
     )
  }
  
  return <>{children}</>;
}
