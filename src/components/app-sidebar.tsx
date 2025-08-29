
"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  AreaChart,
  FolderKanban, 
  LayoutDashboard, 
  LogOut,
  MessageCircle, 
  Settings, 
  Stethoscope,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from './icons';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/predict', label: 'Disease Prediction', icon: Stethoscope, adminOnly: false },
  { href: '/classify', label: 'Dataset Classification', icon: FolderKanban, adminOnly: false },
  { href: '/analytics', label: 'Analytics', icon: AreaChart, adminOnly: false },
  { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };
  
  const availableMenuItems = menuItems.filter(item => !item.adminOnly || (user && user.role === 'Admin'));


  if (!user) {
      // You can return a loader here or null
      return null;
  }


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8" />
          <span className="text-lg font-semibold text-sidebar-foreground">GenoSym-AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {availableMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right' }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/settings'}
              tooltip={{ children: 'Settings', side: 'right' }}
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton asChild>
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="size-7">
                                <AvatarImage src={user.avatar} data-ai-hint="person" alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-left">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-sidebar-foreground/70">{user.specialty}</span>
                                </div>
                            </div>
                        </div>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" side="right" align="end" forceMount>
                     <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                       <LogOut className="mr-2 h-4 w-4" />
                       <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
