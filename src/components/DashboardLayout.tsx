
'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Briefcase, Home, LogOut, Rocket, Users, Settings, UserPlus, Banknote, ListChecks, FileDown } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';
import NotificationBell from './NotificationBell';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [clientId, setClientId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setClientId(currentUser.uid);
      } else {
        if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
          router.push('/admin/login');
        }
        const pathSegments = pathname.split('/');
        if (pathname.startsWith('/client/') && pathSegments.length > 2 && pathSegments[2] && !pathname.includes('/auth')) {
          router.push(`/client/${pathSegments[2]}/auth`);
        }
      }
    });
    return () => unsubscribe();
  }, [pathname, router]);
  
  const handleLogout = async () => {
    await signOut(auth);
    if(pathname.startsWith('/admin')) {
      router.push('/admin/login');
    } else {
      router.push('/');
    }
  };

  const getAvatarFallback = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className='p-8 space-y-4'>
            <Skeleton className="h-[50px] w-1/2 rounded-xl" />
            <Skeleton className="h-[150px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      );
    }
    return children;
  }

  const isAdminSection = pathname.startsWith('/admin');
  const isClientSection = pathname.startsWith('/client');


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Rocket className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">ProFlow</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
             {isAdminSection && (
                <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                    <Link href="/admin">
                        <Home />
                        Admin Dashboard
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/tasks')}>
                    <Link href="/admin/tasks">
                        <ListChecks />
                        All Tasks
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/clients')}>
                    <Link href="/admin/clients">
                        <Users />
                        Manage Clients
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/team')}>
                    <Link href="/admin/team">
                        <UserPlus />
                        Team Members
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/transactions')}>
                    <Link href="/admin/transactions">
                        <Banknote />
                        Transactions
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/export')}>
                    <Link href="/admin/export">
                        <FileDown />
                        Export
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                    <Link href="/admin/settings">
                        <Settings />
                        Settings
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                </>
             )}
             {isClientSection && user && clientId && (
                <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === `/client/${clientId}`}>
                    <Link href={`/client/${clientId}`}>
                        <Briefcase />
                        Dashboard
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.endsWith('/projects') || pathname.includes('/projects/')}>
                    <Link href={`/client/${clientId}/projects`}>
                        <ListChecks />
                        My Projects
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${clientId}/transactions`)}>
                    <Link href={`/client/${clientId}/transactions`}>
                        <Banknote />
                        Transactions
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${clientId}/export`)}>
                    <Link href={`/client/${clientId}/export`}>
                        <FileDown />
                        Export
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${clientId}/settings`)}>
                    <Link href={`/client/${clientId}/settings`}>
                        <Settings />
                        Settings
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                </>
             )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             {loading ? (
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className='flex-1 space-y-1'>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
             ) : user ? (
                <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="User avatar" />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm truncate">{pathname.startsWith('/admin') ? 'Admin' : (user.displayName || 'User')}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                    <LogOut className="h-4 w-4" />
                </Button>
                </div>
            ) : (
                 <p className="text-sm text-muted-foreground">Not logged in</p>
            )}
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 lg:pl-64">
          <header className="flex items-center justify-between p-4 border-b h-16 sticky top-0 bg-background z-30">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              {user && <NotificationBell />}
            </div>
          </header>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
