'use client';
import { cn } from '@/lib/utils';

export default function SkeletonCard({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'p-6 rounded-3xl glass-card animate-pulse bg-white/5 dark:bg-white/10',
                'border border-white/20',
                className
            )}
        >
            <div className="h-4 w-3/4 bg-white/20 rounded mb-2" />
            <div className="h-6 w-1/2 bg-white/20 rounded mb-4" />
            <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-white/20 rounded" />
                <div className="h-8 bg-white/20 rounded" />
            </div>
        </div>
    );
}
