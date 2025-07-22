
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
import { Briefcase, Home, LogOut, Rocket, Users, Settings, UserPlus, Bell, XCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getNotifications, markNotificationAsRead, deleteNotification, clearNotifications } from '@/lib/firebase-service';
import { Notification } from '@/lib/types';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [clientId, setClientId] = React.useState<string | null>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [deletingNotificationId, setDeletingNotificationId] = React.useState<string | null>(null);


  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setClientId(currentUser.uid);
        const isAdmin = pathname.startsWith('/admin');
        const userId = isAdmin ? 'admin' : currentUser.uid;
        setCurrentUserId(userId);
        fetchNotifications(userId);
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

  const fetchNotifications = async (userId: string) => {
      const notifs = await getNotifications(userId);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    if(pathname.startsWith('/admin')) {
      router.push('/admin/login');
    } else {
      router.push('/');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead && currentUserId) {
        await markNotificationAsRead(notification.id);
        fetchNotifications(currentUserId);
    }
    router.push(notification.link);
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent popover from closing or navigating
    setDeletingNotificationId(notificationId);

    setTimeout(async () => {
        try {
            if (currentUserId) {
                await deleteNotification(notificationId);
                toast({ title: "Notification deleted." });
                fetchNotifications(currentUserId);
            }
        } catch {
            toast({ title: "Error", description: "Could not delete notification.", variant: 'destructive' });
        } finally {
            setDeletingNotificationId(null);
        }
    }, 500); // Wait for animation to complete
  };

  const handleClearAllNotifications = async () => {
    try {
        if (currentUserId) {
            await clearNotifications(currentUserId);
            fetchNotifications(currentUserId);
            toast({ title: "All notifications cleared." });
        }
    } catch {
        toast({ title: "Error", description: "Could not clear notifications.", variant: 'destructive' });
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
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b h-16">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0">{unreadCount}</Badge>
                            )}
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-0">
                          <div className="p-2 border-b">
                            <h4 className="font-semibold">Notifications</h4>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                                 <div className="divide-y">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`
                                                flex items-start gap-2 p-3 transition-all duration-500 ease-in-out
                                                ${deletingNotificationId === n.id ? 'animate-slide-out-to-right' : ''}
                                                ${!n.isRead ? 'bg-primary/10' : ''}
                                                cursor-pointer hover:bg-muted
                                            `}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm">{n.message}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleDeleteNotification(e, n.id)}>
                                                <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                <span className="sr-only">Delete notification</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground py-8">
                                    <p>You have no new notifications.</p>
                                </div>
                            )}
                        </div>
                         {notifications.length > 0 && (
                            <div className="p-2 border-t">
                                <Button variant="outline" size="sm" className="w-full" onClick={handleClearAllNotifications}>
                                    Clear All Notifications
                                </Button>
                            </div>
                         )}
                    </PopoverContent>
                </Popover>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
