
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
import { auth, clientAuth } from '@/lib/firebase';
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
    // Determine which auth instance to use based on the route
    const currentAuth = pathname.startsWith('/admin') ? auth : clientAuth;
    const unsubscribe = onAuthStateChanged(currentAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [pathname]);

  const handleLogout = async () => {
    if (pathname.startsWith('/admin')) {
      await signOut(auth);
      router.push('/admin/login');
    } else {
      await signOut(clientAuth);
      if (pathname.startsWith('/client')) {
        router.push('/client-login');
      } else if (pathname.startsWith('/creator')) {
        router.push('/creator/login');
      } else {
        router.push('/');
      }
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
    const getDisplayName = () => {
        if (pathname.startsWith('/admin')) return 'Admin';
        if (pathname.startsWith('/creator')) return 'Creator';
        return user.displayName || 'Client';
    }
    return (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png`} alt="User avatar" />
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm truncate">{getDisplayName()}</p>
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
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const isAdminRoute = pathname.startsWith('/admin');
    const isClientRoute = pathname.startsWith('/client');
    const isCreatorRoute = pathname.startsWith('/creator');

    const authInstance = isAdminRoute ? auth : clientAuth;

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setLoading(false);
        if (!user) {
            if (isAdminRoute) router.push('/admin/login');
            else if (isClientRoute) router.push('/client-login');
            else if (isCreatorRoute) router.push('/creator/login');
        }
    });

    return () => unsubscribe();
  }, [pathname, router]);

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
  const isCreatorSection = pathname.startsWith('/creator');
  const id = (isClientSection || isCreatorSection) ? pathname.split('/')[2] : null;


  return (
    <SidebarProvider>
      <DashboardContent
        isAdminSection={isAdminSection}
        isClientSection={isClientSection}
        isCreatorSection={isCreatorSection}
        id={id}
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
  isCreatorSection,
  id,
  pathname,
}: {
  children: React.ReactNode;
  isAdminSection: boolean;
  isClientSection: boolean;
  isCreatorSection: boolean;
  id: string | null;
  pathname: string;
}) => {
  const { isCollapsed } = useSidebar();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const authInstance = isAdminSection ? auth : clientAuth;
    const unsubscribe = onAuthStateChanged(authInstance, setUser);
    return () => unsubscribe();
  }, [isAdminSection]);
  

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
            {isClientSection && user && id && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === `/client/${id}`}>
                    <Link href={`/client/${id}`}>
                      <Briefcase />
                      <span className={isCollapsed ? 'hidden' : ''}>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.endsWith('/projects') || pathname.includes('/projects/')}>
                    <Link href={`/client/${id}/projects`}>
                      <ListChecks />
                      <span className={isCollapsed ? 'hidden' : ''}>My Projects</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${id}/transactions`)}>
                    <Link href={`/client/${id}/transactions`}>
                      <Banknote />
                      <span className={isCollapsed ? 'hidden' : ''}>Transactions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${id}/export`)}>
                    <Link href={`/client/${id}/export`}>
                      <FileDown />
                      <span className={isCollapsed ? 'hidden' : ''}>Export</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/client/${id}/settings`)}>
                    <Link href={`/client/${id}/settings`}>
                      <Settings />
                      <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
            {isCreatorSection && user && id && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === `/creator/${id}`}>
                    <Link href={`/creator/${id}`}>
                      <Home />
                      <span className={isCollapsed ? 'hidden' : ''}>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/creator/${id}/tasks`)}>
                    <Link href={`/creator/${id}/tasks`}>
                      <ListChecks />
                      <span className={isCollapsed ? 'hidden' : ''}>My Tasks</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`/creator/${id}/settings`)}>
                    <Link href={`/creator/${id}/settings`}>
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
