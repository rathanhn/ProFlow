

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
import { Briefcase, Home, LogOut, Rocket, Users, Settings, UserPlus, Banknote, ListChecks, FileDown, BarChart3, FileText, Calendar, Bell, Shield, HelpCircle, MessageSquare } from 'lucide-react';
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
    const unsubscribeAdmin = onAuthStateChanged(auth, (user) => {
        const isAdminRoute = pathname.startsWith('/admin');
        const isClientRoute = pathname.startsWith('/client'); // Declare here
        const isCreatorRoute = pathname.startsWith('/creator'); // Declare here

        // Log the relevant variables to help debug
        console.log('Auth State Check (Admin Auth):');
        console.log('  pathname:', pathname);
        console.log('  user:', user); // This user is from the admin auth instance
        console.log('  loading:', loading);

        if (isAdminRoute && !user && !loading) {
            console.log('Admin route: User not logged in with Admin Auth. Redirecting to admin login...');
            router.push('/admin/login');
        }
    });

    const unsubscribeClient = onAuthStateChanged(clientAuth, (user) => {
        const isAdminRoute = pathname.startsWith('/admin'); // Declare here
        const isClientRoute = pathname.startsWith('/client');
        const isCreatorRoute = pathname.startsWith('/creator');

        // Log the relevant variables to help debug
        console.log('Auth State Check (Client/Creator Auth):');
        console.log('  pathname:', pathname);
        console.log('  user (from clientAuth listener):', user); // This user is from the clientAuth instance
        console.log('  loading:', loading);

        // Explicitly check if there is a user authenticated with the clientAuth instance
        const clientCreatorUser = clientAuth.currentUser;
        console.log('  clientAuth.currentUser:', clientCreatorUser);


        if ((isClientRoute || isCreatorRoute) && !clientCreatorUser && !loading) {
            console.log('Client/Creator route: No user logged in with Client/Creator Auth. Redirecting to client/creator login...');
             // Redirect to client-login for both client and creator routes if not authenticated with clientAuth
            router.push('/client-login'); // Assuming client-login handles both client and creator authentication
        } else if (isAdminRoute && clientCreatorUser) {
             // If on an admin route but authenticated with clientAuth (shouldn't happen with correct login flow)
             console.log('Admin route: User authenticated with client/creator instance. Redirecting to admin login...');
             router.push('/admin/login');
        } else if ((isClientRoute || isCreatorRoute) && clientCreatorUser && clientCreatorUser.providerId !== clientAuth.currentUser?.providerId) {
            // This case might be redundant with the check above, but kept for clarity
             console.log('Client/Creator route: User authenticated with wrong instance. Redirecting to client/creator login...');
             router.push('/client-login'); // Redirect to client-login for both client and creator routes
        }
    });


    return () => {
        unsubscribeAdmin();
        unsubscribeClient();
    };
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
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/analytics')}>
                    <Link href="/admin/analytics">
                      <BarChart3 />
                      <span className={isCollapsed ? 'hidden' : ''}>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/reports')}>
                    <Link href="/admin/reports">
                      <FileText />
                      <span className={isCollapsed ? 'hidden' : ''}>Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/calendar')}>
                    <Link href="/admin/calendar">
                      <Calendar />
                      <span className={isCollapsed ? 'hidden' : ''}>Calendar</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/notifications')}>
                    <Link href="/admin/notifications">
                      <Bell />
                      <span className={isCollapsed ? 'hidden' : ''}>Notifications</span>
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
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/security')}>
                    <Link href="/admin/security">
                      <Shield />
                      <span className={isCollapsed ? 'hidden' : ''}>Security</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/feedback')}>
                    <Link href="/admin/feedback">
                      <MessageSquare />
                      <span className={isCollapsed ? 'hidden' : ''}>Feedback & Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/help')}>
                    <Link href="/admin/help">
                      <HelpCircle />
                      <span className={isCollapsed ? 'hidden' : ''}>Help & Support</span>
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
        "flex flex-col flex-1 w-full lg:pl-64 overflow-x-hidden min-w-0",
        isCollapsed && "lg:pl-16",
        "transition-all duration-300 ease-in-out"
      )}>
        <header className="sticky-header flex items-center justify-between p-4 h-16 min-w-0">
            {/* ProFlow Logo for Mobile */}
            <div className="flex items-center md:hidden min-w-0">
              <Rocket className="w-6 h-6 text-primary mr-2 flex-shrink-0" />
              <h1 className="text-lg font-semibold truncate">ProFlow</h1>
            </div>

            {/* Desktop keeps the right-aligned content */}
            <div className="flex items-center gap-4 md:ml-auto flex-shrink-0">
              {user && <NotificationBell />}
            </div>
        </header>
        <main className="flex-1 scrollable-content min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl content-area pb-24 md:pb-8 animate-fade-in min-w-0">
            <div className="animate-slide-up min-w-0">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Tab Navigation */}
      <MobileTabs />
    </div>
  );
};
  