
'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ListChecks,
    FileText,
    CheckCircle2,
    Clock,
    Zap,
    Lock,
    Download,
    Calendar,
    User,
    ExternalLink,
    DollarSign,
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    Wallet,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import { INRIcon } from '@/components/ui/inr-icon';
import { MetricCard, DonutChart } from '@/components/ui/charts';
import { getClient, getTasksByClientId, getAssignees, getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { Task, Client, Assignee, WorkStatus } from '@/lib/types';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { Button } from '@/components/ui/button';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PublicClientDashboardPage() {
    const params = useParams();
    const clientId = params.id as string;
    const [client, setClient] = useState<any>(null); // Polymorphic for Client or Creator
    const [clientTasks, setClientTasks] = useState<Task[]>([]);
    const [assignees, setAssignees] = useState<Assignee[]>([]);
    const [portalType, setPortalType] = useState<'client' | 'creator'>('client');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setBy] = useState('newest');
    const [error, setError] = useState<string | null>(null);
    const haptic = useHapticFeedback();

    const loadData = async () => {
        if (!clientId) return;
        setIsLoading(true);
        setError(null);

        try {
            // 1. Try fetching as Client
            let rawEntity = await getClient(clientId) as any;
            let rawTasks: Task[] = [];
            let type: 'client' | 'creator' = 'client';

            if (rawEntity) {
                rawTasks = await getTasksByClientId(clientId);
            } else {
                // 2. Try fetching as Creator (Assignee)
                rawEntity = await getAssignee(clientId);
                if (rawEntity) {
                    type = 'creator';
                    rawTasks = await getTasksByAssigneeId(clientId);
                }
            }

            if (!rawEntity) {
                setError("The requested portal link is invalid or expired.");
                return;
            }

            const allAssignees = await getAssignees();

            // Filter unique assignees who are actually working on these tasks
            const activeAssigneeIds = new Set(rawTasks.map(t => t.assigneeId).filter(Boolean));
            const activeAssignees = allAssignees.filter(a => activeAssigneeIds.has(a.id));

            setPortalType(type);
            setClient(JSON.parse(JSON.stringify(rawEntity)));
            setClientTasks(JSON.parse(JSON.stringify(rawTasks)));
            setAssignees(JSON.parse(JSON.stringify(activeAssignees)));
        } catch (error) {
            console.error('Failed to load data:', error);
            setError('System synchronization failed. Please try again.');
            haptic.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) {
            loadData();
        }
    }, [clientId]);

    const handleRefresh = async () => {
        haptic.androidSwipeRefresh();
        await loadData();
    };

    // Derived filtered and sorted tasks
    const filteredTasks = useMemo(() => {
        let result = [...clientTasks];

        // 1. Filter by search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(task =>
                task.projectName.toLowerCase().includes(lowerSearch) ||
                task.projectNo.toLowerCase().includes(lowerSearch) ||
                (task.notes && task.notes.toLowerCase().includes(lowerSearch))
            );
        }

        // 2. Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(task => task.workStatus === statusFilter);
        }

        // 3. Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return (b.slNo || 0) - (a.slNo || 0);
            if (sortBy === 'oldest') return (a.slNo || 0) - (b.slNo || 0);
            if (sortBy === 'name') return a.projectName.localeCompare(b.projectName);
            if (sortBy === 'deadline') {
                return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
            }
            return 0;
        });

        return result;
    }, [clientTasks, searchTerm, statusFilter, sortBy]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Portal...</p>
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-6 text-center">
                <div className="bg-red-500/10 p-6 rounded-[2.5rem] border border-red-500/20 max-w-md w-full">
                    <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black tracking-tight mb-2 uppercase">Access Denied</h1>
                    <p className="text-muted-foreground text-sm font-medium mb-6">
                        {error || "The requested portal does not exist or has been moved. Use the full login portal for secure access."}
                    </p>
                    <div className="space-y-3">
                        <Button className="w-full h-12 rounded-xl bg-slate-900 font-bold" onClick={() => window.location.reload()}>
                            Retry Sync
                        </Button>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold" asChild>
                            <Link href="/client-login">Secure Member Login</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const projectsInProgress = clientTasks.filter(t => t.workStatus === 'In Progress').length;
    const projectsCompleted = clientTasks.filter(t => t.workStatus === 'Completed').length;

    // Financial calculations
    const totalAmount = clientTasks.reduce((sum, t) => sum + (t.total || 0), 0);
    const amountPaid = clientTasks.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
    const amountPending = Math.max(0, totalAmount - amountPaid);

    return (
        <TooltipProvider delayDuration={300}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
                {/* Public Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">ProFlow <span className="text-muted-foreground font-medium text-sm">Guest</span></span>
                    </div>
                    <Button variant="default" size="sm" asChild className="rounded-full bg-blue-600 hover:bg-blue-700 font-bold">
                        <Link href="/client-login">
                            <Lock className="mr-2 h-3.5 w-3.5" /> Full Access
                        </Link>
                    </Button>
                </header>

                <PullToRefresh onRefresh={handleRefresh}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                        {/* Public Hero */}
                        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-10 text-white shadow-2xl">
                            <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-center gap-5">
                                    <ClickableAvatar
                                        src={client.avatar || client.profilePicture}
                                        fallback={client.name?.charAt(0) || 'U'}
                                        userName={client.name}
                                        userEmail={client.email}
                                        size="xl"
                                        className="h-20 w-20 border-2 border-white/20 shadow-2xl"
                                    />
                                    <div>
                                        <Badge className={`${portalType === 'creator' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'} text-[10px] uppercase font-black tracking-[0.2em] px-3 py-0.5 mb-2`}>
                                            {portalType === 'creator' ? 'Creator Node' : 'Client Portal'}
                                        </Badge>
                                        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">
                                            {client.name}
                                        </h1>
                                        <p className="text-white/50 text-sm font-medium mt-1">Project Roadmap & Live Milestones</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] uppercase font-black text-white/40 mb-1">In Pipeline</p>
                                            <p className="text-2xl font-black">{projectsInProgress}</p>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] uppercase font-black text-white/40 mb-1">Delivered</p>
                                            <p className="text-2xl font-black">{projectsCompleted}</p>
                                        </div>
                                    </div>

                                    {assignees.length > 0 && (
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] uppercase font-black text-white/40 mb-2">Production Team</p>
                                            <div className="flex -space-x-2">
                                                {assignees.map((assignee) => (
                                                    <Tooltip key={assignee.id}>
                                                        <TooltipTrigger asChild>
                                                            <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden cursor-help ring-2 ring-blue-500/20">
                                                                <img src={assignee.avatar || assignee.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee.name}`} alt={assignee.name} className="h-full w-full object-cover" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" className="font-bold text-[10px]">{assignee.name}</TooltipContent>
                                                    </Tooltip>
                                                ))}
                                                {assignees.length > 5 && (
                                                    <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-black text-white px-1">
                                                        +{assignees.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Financial Analytics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <MetricCard
                                title="Total Volume"
                                value={`₹${totalAmount.toLocaleString()}`}
                                icon={<Wallet className="h-6 w-6 text-indigo-500" />}
                                className="glass-card border-indigo-500/20 shadow-indigo-500/5"
                            />
                            <MetricCard
                                title="Settled Amount"
                                value={`₹${amountPaid.toLocaleString()}`}
                                icon={<TrendingUp className="h-6 w-6 text-emerald-500" />}
                                className="glass-card border-emerald-500/20 shadow-emerald-500/5"
                            />
                            <MetricCard
                                title="Outstanding"
                                value={`₹${amountPending.toLocaleString()}`}
                                icon={<ShieldAlert className="h-6 w-6 text-amber-500" />}
                                className="glass-card border-amber-500/20 shadow-amber-500/5"
                            />
                        </div>

                        {/* Quick Analytics */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-4">
                                <MetricCard
                                    title="Milestone Completion"
                                    value={`${Math.round((projectsCompleted / (clientTasks.length || 1)) * 100)}%`}
                                    icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                                    className="glass-card border-emerald-500/20 shadow-emerald-500/5 h-full"
                                />
                            </div>
                            <div className="md:col-span-8">
                                <Card className="glass-card border-white/20 shadow-xl overflow-hidden h-full">
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div className="space-y-1">
                                            <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Active Velocity</p>
                                            <p className="text-2xl font-black">Production Status</p>
                                        </div>
                                        <DonutChart
                                            data={[
                                                { label: 'Pending', value: clientTasks.filter(t => t.workStatus === 'Pending').length, color: '#94a3b8' },
                                                { label: 'Running', value: projectsInProgress, color: '#3b82f6' },
                                                { label: 'Done', value: projectsCompleted, color: '#10b981' },
                                            ]}
                                            size={100}
                                            strokeWidth={12}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Task List Section */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <ListChecks className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-black text-lg tracking-tight">Project Artifacts ({filteredTasks.length})</h2>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Search input */}
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search projects..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 h-10 rounded-xl border-border/50 focus:border-blue-500 transition-all font-medium"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-border/50 font-bold uppercase text-[10px] tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <SlidersHorizontal className="h-3 w-3" />
                                                <SelectValue placeholder="Status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50">
                                            <SelectItem value="all">ALL STATUS</SelectItem>
                                            <SelectItem value="Pending">PENDING</SelectItem>
                                            <SelectItem value="In Progress">ACTIVE</SelectItem>
                                            <SelectItem value="Completed">FINISHED</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setBy}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-border/50 font-bold uppercase text-[10px] tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <ArrowUpDown className="h-3 w-3" />
                                                <SelectValue placeholder="Sort" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50">
                                            <SelectItem value="newest">NEWEST FIRST</SelectItem>
                                            <SelectItem value="oldest">OLDEST FIRST</SelectItem>
                                            <SelectItem value="deadline">DEADLINE SOON</SelectItem>
                                            <SelectItem value="name">NAME A-Z</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => {
                                        const daysRemaining = Math.ceil((new Date(task.submissionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                        const isOverdue = daysRemaining < 0 && task.workStatus !== 'Completed';

                                        return (
                                            <div key={task.id} className="glass-card rounded-[2rem] p-6 sm:p-8 hover-lift relative group transition-all duration-500 border-white/20 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent backdrop-blur-xl">
                                                {/* Decorative Background Element */}
                                                <div className="absolute -top-24 -right-24 h-64 w-64 bg-blue-500/5 blur-[80px] rounded-full transition-all duration-1000 group-hover:bg-blue-500/10 group-hover:scale-125"></div>

                                                <div className="relative z-10 flex flex-col gap-6">
                                                    {/* Header Row */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black tracking-[0.2em] uppercase py-1.5 px-3 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20">
                                                                {task.projectNo}
                                                            </span>
                                                            <div className="h-4 w-[1px] bg-border/50"></div>
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <User className="h-3.5 w-3.5 text-blue-500/60" />
                                                                <span className="text-[11px] font-bold tracking-tight uppercase">{task.assigneeName || 'Creative Team'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {task.outputFileLink && (
                                                                <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl bg-white/50 dark:bg-white/5 border-white/20 hover:bg-blue-600 hover:text-white transition-all shadow-sm" asChild>
                                                                    <a href={task.outputFileLink} target="_blank" rel="noopener noreferrer">
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            )}
                                                            <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl bg-white/50 dark:bg-white/5 border-white/20 hover:bg-blue-600 hover:text-white transition-all shadow-sm" asChild>
                                                                <Link href="/client-login">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Project Identity */}
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-foreground group-hover:text-blue-600 transition-all duration-500 uppercase">
                                                            {task.projectName}
                                                        </h3>
                                                        {task.notes && (
                                                            <p className="text-muted-foreground text-xs line-clamp-1 opacity-60 font-medium italic">
                                                                &quot;{task.notes}&quot;
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Metrics Section */}
                                                    <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge className={`border-none px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded-lg shadow-sm ${task.workStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                task.workStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                {task.workStatus}
                                                            </Badge>

                                                            {task.workStatus !== 'Completed' && (
                                                                <>
                                                                    {isOverdue && (
                                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-600 rounded-lg border border-red-500/20 animate-pulse">
                                                                            <Clock className="h-3 w-3" />
                                                                            <span className="text-[9px] font-black uppercase tracking-widest">Overdue</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-200">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                                            {new Date(task.submissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {task.workStatus === 'Completed' && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            {task.assigneeId && assignees.find(a => a.id === task.assigneeId) && (
                                                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                                                    <div className="h-5 w-5 rounded-full overflow-hidden border border-blue-500/20 bg-blue-500/5">
                                                                        <img
                                                                            src={assignees.find(a => a.id === task.assigneeId)?.avatar || assignees.find(a => a.id === task.assigneeId)?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigneeName}`}
                                                                            className="h-full w-full object-cover"
                                                                            alt=""
                                                                        />
                                                                    </div>
                                                                    <span className="text-[9px] font-black uppercase text-blue-600/70 tracking-tighter truncate max-w-[80px]">
                                                                        {task.assigneeName?.split(' ')[0]}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 leading-none mb-1">Production</span>
                                                                <span className="text-xl font-black text-foreground tabular-nums tracking-tighter">
                                                                    {Math.round((task.amountPaid / (task.total || 1)) * 100)}%
                                                                </span>
                                                            </div>
                                                            <div className="w-24">
                                                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                                                    <div
                                                                        className={`h-full transition-all duration-1000 ease-out ${task.workStatus === 'Completed' ? "bg-emerald-500" : "bg-blue-600"
                                                                            }`}
                                                                        style={{ width: `${Math.min((task.amountPaid / (task.total || 1)) * 100, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                                            <FileText className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="text-muted-foreground font-bold italic">No projects match your current filters.</p>
                                        {(searchTerm || statusFilter !== 'all') && (
                                            <Button variant="ghost" className="text-blue-600 font-bold" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                                                Clear all filters
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Guest Footer Notice */}
                        <div className="p-8 rounded-[2rem] bg-blue-600/5 border border-blue-600/10 text-center space-y-4">
                            <h3 className="font-black text-blue-900 dark:text-blue-100 uppercase tracking-tighter text-xl">Need more details?</h3>
                            <p className="text-sm text-blue-700/70 max-w-sm mx-auto font-medium">
                                Login to your account to access invoices, transaction history, creative settings, and direct chat with our production team.
                            </p>
                            <Button asChild className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-sm tracking-widest">
                                <Link href="/client-login">Secure Login</Link>
                            </Button>
                        </div>
                    </div>
                </PullToRefresh>
            </div>
        </TooltipProvider>
    );
}
