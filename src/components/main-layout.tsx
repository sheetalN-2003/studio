import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from './app-header';
import { AuthGuard } from '@/components/auth-guard';

export function MainLayout({ 
  children,
  pageTitle,
  showTitle = true,
}: { 
  children: React.ReactNode,
  pageTitle: string,
  showTitle?: boolean,
}) {
  return (
    <AuthGuard>
        <SidebarProvider>
        <div className="flex min-h-screen bg-background">
            <AppSidebar />
            <SidebarInset className="bg-background">
            {showTitle && <AppHeader title={pageTitle} />}
            <main className="p-4 sm:p-6 lg:p-8 pt-0">
                {children}
            </main>
            </SidebarInset>
        </div>
        </SidebarProvider>
    </AuthGuard>
  );
}
