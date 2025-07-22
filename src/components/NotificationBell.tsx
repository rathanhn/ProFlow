
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getNotifications, markNotificationAsRead, deleteNotification, clearNotifications } from '@/lib/firebase-service';
import { Notification } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function NotificationBell() {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
    const [deletingNotificationId, setDeletingNotificationId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const isAdmin = pathname.startsWith('/admin');
                const userId = isAdmin ? 'admin' : currentUser.uid;
                setCurrentUserId(userId);
                fetchNotifications(userId);
            }
        });
        return () => unsubscribe();
    }, [pathname]);

    const fetchNotifications = async (userId: string) => {
        const notifs = await getNotifications(userId);
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
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
    
    if (!currentUserId) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 bg-background border">
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
    );
}
