'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Achievements, { AchievementGallery } from '@/components/Achievements';
import { getClient, getTasksByClientId } from '@/lib/firebase-service';
import { Task, Client } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { Sparkles, Trophy, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClientAchievementsPage({ params }: { params: Promise<{ id: string }> }) {
    const [clientId, setClientId] = useState<string>('');
    const [client, setClient] = useState<Client | null>(null);
    const [clientTasks, setClientTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const haptic = useHapticFeedback();
    const { user } = useAuth();

    useEffect(() => {
        const loadParams = async () => {
            const resolvedParams = await params;
            setClientId(resolvedParams.id);
        };
        loadParams();
    }, [params]);

    const loadData = async () => {
        if (!clientId) return;
        try {
            const [rawClient, rawClientTasks] = await Promise.all([
                getClient(clientId),
                getTasksByClientId(clientId)
            ]);
            if (rawClient) {
                setClient(JSON.parse(JSON.stringify(rawClient)) as Client);
                setClientTasks(JSON.parse(JSON.stringify(rawClientTasks)) as Task[]);
            }
        } catch (error) {
            console.error('Failed to load achievements data:', error);
            haptic.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) loadData();
    }, [clientId]);

    const handleRefresh = async () => {
        haptic.androidSwipeRefresh();
        await loadData();
    };

    if (isLoading || !client) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    const taskCount = clientTasks.filter(t => t.workStatus === 'Completed').length;
    const totalSpent = clientTasks.reduce((acc, task) => acc + (task.amountPaid || 0), 0);

    return (
        <DashboardLayout>
            <PullToRefresh onRefresh={handleRefresh}>
                <div className="space-y-8 fab-safe-bottom pt-4">
                    {/* Hero Header */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-lg">
                                    <Trophy className="h-7 w-7 text-yellow-300" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold px-2 py-0 h-4 tracking-widest">
                                            Partner Rank
                                        </Badge>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-1 leading-tight">
                                        Achievement <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white">Center</span>
                                    </h1>
                                </div>
                            </div>
                            <p className="italic opacity-70 text-sm max-w-xl border-l-2 border-white/20 pl-4">
                                Tracking your operational legacy. Your growth is our primary mission objective.
                            </p>
                        </div>
                    </div>

                    {/* Overview Component */}
                    <Achievements taskCount={taskCount} moneyValue={totalSpent} type="client" />

                    {/* Detailed Gallery */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Technical Breakdown</h2>
                        </div>
                        <AchievementGallery taskCount={taskCount} moneyValue={totalSpent} type="client" />
                    </div>
                </div>
            </PullToRefresh>
        </DashboardLayout>
    );
}
