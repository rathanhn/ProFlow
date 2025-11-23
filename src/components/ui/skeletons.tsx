'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const CardSkeleton = () => (
    <Card className="glass-card border-white/20 dark:border-white/10">
        <CardHeader>
            <div className="skeleton h-6 w-32 mb-2" />
            <div className="skeleton h-4 w-48" />
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-4/6" />
            </div>
        </CardContent>
    </Card>
);

export const StatCardSkeleton = () => (
    <Card className="glass-card border-white/20 dark:border-white/10">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-8 w-32" />
                </div>
                <div className="skeleton h-12 w-12 rounded-full" />
            </div>
        </CardContent>
    </Card>
);

export const TableRowSkeleton = () => (
    <div className="flex items-center gap-4 p-4 border-b border-white/10">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-3 w-32" />
        </div>
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-4 w-20" />
    </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <Card className="glass-card border-white/20 dark:border-white/10">
        <CardContent className="p-0">
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} />
            ))}
        </CardContent>
    </Card>
);

export const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div>
            <div className="skeleton h-8 w-48 mb-2" />
            <div className="skeleton h-4 w-64" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    </div>
);

export const ListSkeleton = ({ items = 3 }: { items?: number }) => (
    <div className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
            <Card key={i} className="glass-card border-white/20 dark:border-white/10">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="skeleton h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-3/4" />
                            <div className="skeleton h-3 w-1/2" />
                        </div>
                        <div className="skeleton h-8 w-20 rounded" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);
