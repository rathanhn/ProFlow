
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { markNotificationAsRead, deleteNotification, clearNotifications } from '@/lib/firebase-service';
import { Notification } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


// This function was moved here from firebase-service.ts because it sets up a client-side listener
// and is not a Server Action.
function getNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const q = query(
        collection(db, "notifications"), 
        where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        // Sort notifications on the client-side
        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(notifications.slice(0, 50)); // Limit to 50 after sorting
    }, (error) => {
        console.error("Error fetching notifications:", error);
        callback([]);
    });

    return unsubscribe; // Return the unsubscribe function to be called on cleanup
}


export default function NotificationBell() {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
    const [deletingNotificationId, setDeletingNotificationId] = React.useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);


    React.useEffect(() => {
        const determineUserId = (currentUser: import('firebase/auth').User | null) => {
            if (!currentUser) return null;
            const isAdmin = pathname.startsWith('/admin');
            return isAdmin ? 'admin' : currentUser.uid;
        };
        
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            const userId = determineUserId(currentUser);
            if (userId && userId !== currentUserId) {
                setCurrentUserId(userId);
            } else if (!currentUser) {
                setCurrentUserId(null);
                setNotifications([]);
                setUnreadCount(0);
            }
        });

        return () => unsubscribe();
    }, [pathname, currentUserId]);


    React.useEffect(() => {
        if (currentUserId) {
            const unsubscribe = getNotifications(currentUserId, (notifs) => {
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.isRead).length);
            });
            return () => unsubscribe();
        }
    }, [currentUserId]);


    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead && currentUserId) {
            await markNotificationAsRead(notification.id);
        }
        router.push(notification.link);
        setIsPopoverOpen(false);
    };

    const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation(); // Prevent popover from closing or navigating
        setDeletingNotificationId(notificationId);

        setTimeout(async () => {
            try {
                if (currentUserId) {
                    await deleteNotification(notificationId);
                    toast({ title: "Notification deleted." });
                }
            } catch {
                toast({ title: "Error", description: "Could not delete notification.", variant: 'destructive' });
            } finally {
                setDeletingNotificationId(null);
            }
        }, 300); 
    };

    const handleClearAllNotifications = async () => {
        try {
            if (currentUserId) {
                await clearNotifications(currentUserId);
                toast({ title: "All notifications cleared." });
            }
        } catch {
            toast({ title: "Error", description: "Could not clear notifications.", variant: 'destructive' });
        }
    };
    
    if (!currentUserId) return null;

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 bg-background border">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs justify-center rounded-full p-0">{unreadCount}</Badge>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex justify-between items-center p-2 border-b">
                    <h4 className="font-semibold px-2">Notifications</h4>
                     {notifications.length > 0 && (
                        <Button variant="link" size="sm" className="text-xs" onClick={handleClearAllNotifications}>
                            Clear All
                        </Button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`
                                        flex items-start gap-2 p-3 transition-all duration-300 ease-in-out
                                        ${deletingNotificationId === n.id ? 'translate-x-full opacity-0' : ''}
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
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => handleDeleteNotification(e, n.id)}>
                                        <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                        <span className="sr-only">Delete notification</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground py-8 px-4">
                            <p>You have no new notifications.</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
