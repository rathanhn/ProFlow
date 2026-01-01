'use client';
import { useEffect, useState } from 'react';

export default function OfflineBadge() {
    const [offline, setOffline] = useState(false);
    useEffect(() => {
        setOffline(!navigator.onLine);
        const onOnline = () => setOffline(false);
        const onOffline = () => setOffline(true);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    if (!offline) return null;
    return (
        <div className="fixed bottom-4 right-4 bg-rose-500/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg border border-white/10 animate-in slide-in-from-bottom-4 z-50 font-bold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            Offline Mode
        </div>
    );
}
