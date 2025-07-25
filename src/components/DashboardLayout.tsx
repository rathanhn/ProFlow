
'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Briefcase, Home, LogOut, Rocket, Users, Settings, UserPlus, Banknote, ListChecks, FileDown } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';
import NotificationBell from './NotificationBell';


const UserProfile = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        {!isCollapsed && (
          <div className='flex-1 space-y-1'>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        )}
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" />
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm truncate">{pathname.startsWith('/admin') ? 'Admin' : (user.displayName || 'User')}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    !isCollapsed && <p className="text-sm text-muted-foreground">Not logged in</p>
  );
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [clientId, setClientId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // Extract client ID from path for client-side navigation
        if (pathname.startsWith('/client/')) {
            const pathSegments = pathname.split('/');
            setClientId(pathSegments[2] || null);
        }
      }
    });
    return () => unsubscribe();
  }, [pathname]);

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
      <DashboardContent
        isAdminSection={isAdminSection}
        isClientSection={isClientSection}
        user={user}
        clientId={clientId}
        pathname={pathname}
      >
        {renderContent()}
      </DashboardContent>
    </SidebarProvider>
  );
}

// Create a new component to consume the sidebar context
const DashboardContent = ({
  children,
  isAdminSection,
  isClientSection,
  user,
  clientId,
  pathname,
}: {
  children: React.ReactNode;
  isAdminSection: boolean;
  isClientSection: boolean;
  user: User | null;
  clientId: string | null;
  pathname: string;
}) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarHeader>
          <Rocket className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">ProFlow</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {isAdminSection && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                    <Link href="/admin">
                      <Home />
                      <span className={isCollapsed ? 'hidden' : ''}>Admin Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/tasks')}>
                    <Link href="/admin/tasks">
                      <ListChecks />
                      <span className={isCollapsed ? 'hidden' : ''}>All Tasks</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/clients')}>
                    <Link href="/admin/clients">
                      <Users />
                      <span className={isCollapsed ? 'hidden' : ''}>Manage Clients</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/team')}>
                    <Link href="/admin/team">
                      <UserPlus />
                      <span className={isCollapsed ? 'hidden' : ''}>Creators</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/transactions')}>
                    <Link href="/admin/transactions">
                      <Banknote />
                      <span className={isCollapsed ? 'hidden' : ''}>Transactions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/export')}>
                    <Link href="/admin/export">
                      <FileDown />
                      <span className={isCollapsed ? 'hidden' : ''}>Export</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/settings')}>
                    <Link href="/admin/settings">
                      <Settings />
                      <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
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
                      <span className={isCollapsed ? 'hidden' : ''}>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.endsWith('/projects') || pathname.includes('/projects/')}>
                    <Link href={`/client/${clientId}/projects`}>
                      <ListChecks />
                      <span className={isCollapsed ? 'hidden' : ''}>My Projects</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${clientId}/transactions`)}>
                    <Link href={`/client/${clientId}/transactions`}>
                      <Banknote />
                      <span className={isCollapsed ? 'hidden' : ''}>Transactions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${clientId}/export`)}>
                    <Link href={`/client/${clientId}/export`}>
                      <FileDown />
                      <span className={isCollapsed ? 'hidden' : ''}>Export</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${clientId}/settings`)}>
                    <Link href={`/client/${clientId}/settings`}>
                      <Settings />
                      <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserProfile />
        </SidebarFooter>
      </Sidebar>
      <div
        className="flex-1 transition-all duration-300 ease-in-out lg:pl-64 data-[collapsed=true]:lg:pl-16"
        data-collapsed={isCollapsed}
      >
        <header className="flex items-center justify-between p-4 border-b h-16 sticky top-0 bg-background z-30">
            <div className="flex items-center">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
              {user && <NotificationBell />}
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">{children}</main>
      </div>
    </div>
  );
};
