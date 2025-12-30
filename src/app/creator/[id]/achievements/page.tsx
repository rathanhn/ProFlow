'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Achievements, { AchievementGallery } from '@/components/Achievements';
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { Task, Assignee } from '@/lib/types';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { Sparkles, Trophy, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CreatorAchievementsPage({ params }: { params: Promise<{ id: string }> }) {
    const [creatorId, setCreatorId] = useState<string>('');
    const [creator, setCreator] = useState<Assignee | null>(null);
    const [creatorTasks, setCreatorTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const haptic = useHapticFeedback();

    useEffect(() => {
        const loadParams = async () => {
            const resolvedParams = await params;
            setCreatorId(resolvedParams.id);
        };
        loadParams();
    }, [params]);

    const loadData = async () => {
        if (!creatorId) return;
        try {
            const [rawCreator, rawTasks] = await Promise.all([
                getAssignee(creatorId),
                getTasksByAssigneeId(creatorId)
            ]);
            if (rawCreator) {
                setCreator(JSON.parse(JSON.stringify(rawCreator)) as Assignee);
                setCreatorTasks(JSON.parse(JSON.stringify(rawTasks)) as Task[]);
            }
        } catch (error) {
            console.error('Failed to load creator achievements data:', error);
            haptic.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (creatorId) loadData();
    }, [creatorId]);

    const handleRefresh = async () => {
        haptic.androidSwipeRefresh();
        await loadData();
    };

    if (isLoading || !creator) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    const taskCount = creatorTasks.filter(t => t.workStatus === 'Completed').length;
    const totalEarnings = creatorTasks
        .filter(task => task.paymentStatus === 'Paid')
        .reduce((sum, task) => sum + (task.amountPaid || 0), 0);

    return (
        <DashboardLayout>
            <PullToRefresh onRefresh={handleRefresh}>
                <div className="space-y-8 fab-safe-bottom pt-4">
                    {/* Hero Header */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 p-8 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-lg">
                                    <Sparkles className="h-7 w-7 text-emerald-300" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold px-2 py-0 h-4 tracking-widest">
                                            Creator Rank
                                        </Badge>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-1 leading-tight">
                                        Creative <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">Trophies</span>
                                    </h1>
                                </div>
                            </div>
                            <p className="italic opacity-70 text-sm max-w-xl border-l-2 border-white/20 pl-4">
                                Celebrating your creative output and tactical precision. Your legacy is built mission by mission.
                            </p>
                        </div>
                    </div>

                    {/* Overview Component */}
                    <Achievements taskCount={taskCount} moneyValue={totalEarnings} type="creator" />

                    {/* Detailed Gallery */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Trophy className="h-5 w-5 text-emerald-500" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Technical Breakdown</h2>
                        </div>
                        <AchievementGallery taskCount={taskCount} moneyValue={totalEarnings} type="creator" />
                    </div>
                </div>
            </PullToRefresh>
        </DashboardLayout>
    );
}
