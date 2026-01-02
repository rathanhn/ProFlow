'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Edit,
    Plus,
    Mail,
    Phone,
    DollarSign,
    Zap,
    CheckCircle2,
    Clock,
    Sparkles,
    Briefcase
} from 'lucide-react';
import { Assignee, Task } from '@/lib/types';
import TaskList from '@/components/TaskList';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/charts';
import { INRIcon } from '@/components/ui/inr-icon';

interface CreatorTasksViewProps {
    creator: Assignee;
    tasks: Task[];
}

export default function CreatorTasksView({ creator, tasks }: CreatorTasksViewProps) {
    const router = useRouter();

    const completedTasks = tasks.filter(t => t.workStatus === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.workStatus === 'In Progress').length;
    const pendingTasks = tasks.filter(t => t.workStatus === 'Pending').length;
    const totalValue = tasks.reduce((acc, t) => acc + (t.total || 0), 0);

    return (
        <div className="space-y-8 fab-safe-bottom pt-4">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 ring-4 ring-white/20 shadow-2xl">
                            <AvatarImage src={creator.avatar} alt={creator.name} />
                            <AvatarFallback className="text-3xl bg-violet-500 font-black">{creator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-white/80 text-[10px] font-black uppercase tracking-widest leading-none">
                                    Creative Lead
                                </span>
                                <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold px-2 py-0 h-4">
                                    Active
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-1 leading-tight">
                                {creator.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-white/60">
                                    <Mail className="h-3.5 w-3.5 text-purple-300" /> {creator.email}
                                </div>
                                {creator.mobile && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-white/60">
                                        <Phone className="h-3.5 w-3.5 text-violet-300" /> {creator.mobile}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-xl font-bold" onClick={() => router.push(`/admin/team/${creator.id}/edit?redirect=/admin/team/${creator.id}`)}>
                            <Edit className="mr-2 h-5 w-5" /> Edit Profile
                        </Button>
                        <Button className="h-12 bg-white text-violet-700 hover:bg-violet-50 font-black shadow-xl" onClick={() => router.push(`/admin/tasks/new?assigneeId=${creator.id}&redirect=/admin/team/${creator.id}`)}>
                            <Plus className="mr-2 h-5 w-5" /> Assign Task
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Assignments"
                    value={tasks.length}
                    icon={<Briefcase className="h-6 w-6 text-violet-500" />}
                    className="glass-card border-violet-500/20 shadow-violet-500/5"
                />
                <MetricCard
                    title="Completed"
                    value={completedTasks}
                    icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                    className="glass-card border-emerald-500/20 shadow-emerald-500/5"
                />
                <MetricCard
                    title="In Progress"
                    value={inProgressTasks}
                    icon={<Zap className="h-6 w-6 text-blue-500" />}
                    className="glass-card border-blue-500/20 shadow-blue-500/5"
                />
                <MetricCard
                    title="Success Rate"
                    value={`${Math.round((completedTasks / (tasks.length || 1)) * 100)}%`}
                    icon={<Sparkles className="h-6 w-6 text-amber-500" />}
                    className="glass-card border-amber-500/20 shadow-amber-500/5"
                />
            </div>

            {/* Tasks List */}
            <div className="glass-card border-white/20 shadow-2xl overflow-hidden rounded-[2.5rem]">
                <TaskList
                    tasks={tasks}
                    title={`${creator.name}'s Assignment Board`}
                    showClient={true}
                    showAddButton={true}
                    addButtonLink={`/admin/tasks/new?assigneeId=${creator.id}&redirect=/admin/team/${creator.id}`}
                    emptyStateMessage="NO ASSIGNMENTS"
                    emptyStateDescription={`${creator.name} has no tasks assigned in the current cycle.`}
                />
            </div>
        </div>
    );
}
