'use client';

export default function LoadingSpinner() {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />

                {/* Spinner Tracks */}
                <div className="h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-800" />

                {/* Animated Segment */}
                <div className="absolute top-0 h-16 w-16 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent transition-all duration-300" />

                {/* Center Dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full animate-ping" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-1.5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 animate-pulse">
                    Synchronizing Hub
                </p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Decrypting Secure Streams
                </p>
            </div>
        </div>
    );
}
