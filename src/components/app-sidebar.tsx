
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
import { AiChat } from './ai-chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from '@/ai/flows/user-auth-flow';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/predict', label: 'Disease Prediction', icon: Stethoscope },
  { href: '/classify', label: 'Dataset Classification', icon: FolderKanban },
  { href: '/analytics', label: 'Analytics', icon: AreaChart },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    }
  };


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
          {menuItems.map((item) => (
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
            <AiChat>
                <SidebarMenuButton
                tooltip={{ children: 'AI Assistant', side: 'right' }}
                >
                <MessageCircle />
                <span>AI Assistant</span>
                </SidebarMenuButton>
            </AiChat>
          </SidebarMenuItem>
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
                                <AvatarImage src="https://picsum.photos/100" data-ai-hint="person" alt="Dr. Emily Carter" />
                                <AvatarFallback>EC</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-left">
                                <span className="text-sm font-medium">Dr. Emily Carter</span>
                                <span className="text-xs text-sidebar-foreground/70">Cardiologist</span>
                                </div>
                            </div>
                        </div>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" side="right" align="end" forceMount>
                     <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">Dr. Emily Carter</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            emily.carter@med.example.com
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
