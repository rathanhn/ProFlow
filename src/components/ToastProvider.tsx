'use client';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                className: cn(
                    'bg-white/10 backdrop-blur-md border border-white/20',
                    'text-foreground shadow-lg'
                ),
                duration: 4000,
            }}
        />
    );
}
