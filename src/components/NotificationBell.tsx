
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
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/lib/haptic-feedback';


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
    const haptics = useHapticFeedback();


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
                const prevCount = notifications.filter(n => !n.isRead).length;
                const newCount = notifs.filter(n => !n.isRead).length;

                if (newCount > prevCount) {
                    haptics.androidNotification();
                }

                setNotifications(notifs);
                setUnreadCount(newCount);
            });
            return () => unsubscribe();
        }
    }, [currentUserId, notifications.length]);


    const handleNotificationClick = async (notification: Notification) => {
        haptics.selection();
        if (!notification.isRead && currentUserId) {
            await markNotificationAsRead(notification.id);
        }
        router.push(notification.link);
        setIsPopoverOpen(false);
    };

    const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        haptics.impact();
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
        haptics.warning();
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
        <Popover open={isPopoverOpen} onOpenChange={(open) => {
            if (open) haptics.light();
            setIsPopoverOpen(open);
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl h-10 w-10 bg-background/50 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <Bell className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-blue-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-background shadow-lg shadow-blue-500/40 animate-in zoom-in-50">
                            {unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[22rem] p-0 overflow-hidden border-none bg-transparent shadow-none mt-2">
                <div className="glass-card dark:bg-slate-900/95 border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Command Intel</h4>
                        </div>
                        {notifications.length > 0 && (
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 rounded-lg px-2" onClick={handleClearAllNotifications}>
                                Purge All
                            </Button>
                        )}
                    </div>
                    <div className="max-h-[28rem] overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-white/10">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`
                                            group flex items-start gap-3 p-4 transition-all duration-300
                                            ${deletingNotificationId === n.id ? 'translate-x-[120%] opacity-0' : ''}
                                            ${!n.isRead ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-muted/50'}
                                            cursor-pointer
                                        `}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className={cn(
                                            "mt-1 h-2 w-2 rounded-full shrink-0 transition-all duration-500",
                                            !n.isRead ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-muted-foreground/20"
                                        )}></div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn(
                                                "text-xs leading-relaxed transition-colors",
                                                !n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                                            )}>{n.message}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-tighter">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground/20">•</span>
                                                <p className="text-[10px] font-medium text-muted-foreground/60 italic">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 hover:text-rose-500"
                                            onClick={(e) => handleDeleteNotification(e, n.id)}
                                        >
                                            <XCircle className="h-4 w-4" />
                                            <span className="sr-only">Dismiss</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-4">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 mb-4">
                                    <Bell className="h-6 w-6 text-muted-foreground opacity-20" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Zero active transmissions</p>
                                <p className="text-xs font-bold text-muted-foreground/30 mt-1 italic">Awaiting briefing...</p>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
