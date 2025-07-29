

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
  useSidebar
} from '@/components/ui/sidebar';
import { MobileTabs } from '@/components/ui/mobile-tabs';
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Briefcase, Home, LogOut, Rocket, Users, Settings, UserPlus, Banknote, ListChecks, FileDown } from 'lucide-react';
import { auth, clientAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';
import NotificationBell from './NotificationBell';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const UserProfile = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { isCollapsed, user, loading } = useSidebar();
  const { isOpen, imageData, openViewer, closeViewer } = useProfileImageViewer();

  const handleLogout = async () => {
     const currentAuth = pathname.startsWith('/admin') ? auth : clientAuth;
    try {
        await signOut(currentAuth);
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
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
        toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  const getAvatarFallback = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    return 'U';
  };
  
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (pathname.startsWith('/admin')) return 'Admin';
    if (pathname.startsWith('/creator')) return 'Creator';
    return user?.email || 'User';
  }


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
      <>
        <div className="flex items-center gap-3">
          <Avatar
            className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all duration-200"
            onClick={() => {
              // Always open viewer - use photoURL if available, otherwise create a placeholder
              const imageUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&size=400&background=0ea5e9&color=ffffff&bold=true`;
              openViewer(imageUrl, getDisplayName(), user.email || undefined);
            }}
          >
            <AvatarImage src={user.photoURL || undefined} alt="User avatar" />
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

        {/* Profile Image Viewer */}
        <ProfileImageViewer
          isOpen={isOpen}
          onClose={closeViewer}
          imageUrl={imageData.imageUrl}
          userName={imageData.userName}
          userEmail={imageData.userEmail}
        />
      </>
    );
  }

  return (
    !isCollapsed && <p className="text-sm text-muted-foreground">Not logged in</p>
  );
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </SidebarProvider>
  );
}

// Create a new component to consume the sidebar context
const DashboardContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, user, loading } = useSidebar();
  
  React.useEffect(() => {
    const isAdminRoute = pathname.startsWith('/admin');
    const isClientRoute = pathname.startsWith('/client');
    const isCreatorRoute = pathname.startsWith('/creator');

    // Choose the correct auth instance based on the current path
    const authInstance = isAdminRoute ? auth : clientAuth;

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (!user && !loading) {
        if (isAdminRoute) router.push('/admin/login');
        else if (isClientRoute) router.push('/client-login');
        else if (isCreatorRoute) router.push('/creator/login');
      }
    });

    return () => unsubscribe();
  }, [pathname, router, loading]);

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
    <div className="flex h-screen bg-muted/40 overflow-hidden">
      <Sidebar className="hidden md:flex">
        <SidebarHeader>
          <Rocket className="w-6 h-6 text-primary" />
          {!isCollapsed && <h1 className="text-xl font-semibold">ProFlow</h1>}
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
      <div className={cn(
        "flex flex-col flex-1 w-full lg:pl-64 overflow-x-hidden", 
        isCollapsed && "lg:pl-16",
        "transition-all duration-300 ease-in-out"
      )}>
        <header className="sticky-header flex items-center justify-between p-4 h-16">
            {/* ProFlow Logo for Mobile */}
            <div className="flex items-center md:hidden">
              <Rocket className="w-6 h-6 text-primary mr-2" />
              <h1 className="text-lg font-semibold">ProFlow</h1>
            </div>

            {/* Desktop keeps the right-aligned content */}
            <div className="flex items-center gap-4 md:ml-auto">
              {user && <NotificationBell />}
            </div>
        </header>
        <main className="flex-1 scrollable-content">
          <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl content-area pb-24 md:pb-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Tab Navigation */}
      <MobileTabs />
    </div>
  );
};
  