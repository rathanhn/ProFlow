'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ListChecks,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  Settings,
  CalendarCheck2,
  Sparkles,
  Zap
} from 'lucide-react';
import { INRIcon } from '@/components/ui/inr-icon';
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { Assignee, Task } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { MetricCard, DonutChart } from '@/components/ui/charts';
import Achievements from '@/components/Achievements';

interface CreatorDashboardClientProps {
  initialCreator: Assignee;
  initialTasks: Task[];
}

export default function CreatorDashboardClient({
  initialCreator,
  initialTasks
}: CreatorDashboardClientProps) {
  const [creator, setCreator] = useState(initialCreator);
  const [creatorTasks, setCreatorTasks] = useState(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const haptic = useHapticFeedback();
  const router = useRouter();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rawCreator, rawCreatorTasks] = await Promise.all([
        getAssignee(creator.id),
        getTasksByAssigneeId(creator.id)
      ]);

      if (rawCreator) {
        setCreator(JSON.parse(JSON.stringify(rawCreator)) as Assignee);
      }
      setCreatorTasks(JSON.parse(JSON.stringify(rawCreatorTasks)) as Task[]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      haptic.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    haptic.androidSwipeRefresh();
    await loadData();
  };

  // Calculate statistics
  const totalEarnings = creatorTasks
    .filter(task => task.paymentStatus === 'Paid')
    .reduce((sum, task) => sum + task.amountPaid, 0);

  const projectsInProgress = creatorTasks.filter(task =>
    task.workStatus === 'In Progress'
  ).length;

  const completedProjects = creatorTasks.filter(task =>
    task.workStatus === 'Completed'
  ).length;

  const upcomingDeadlines = creatorTasks
    .filter(task => task.workStatus !== 'Completed')
    .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime())
    .slice(0, 5);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-8 fab-safe-bottom pt-4">

        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-emerald-500/20">
          <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border-2 border-white/40 shadow-xl">
                  <AvatarImage src={creator.avatar || creator.profilePicture} />
                  <AvatarFallback className="text-2xl bg-emerald-500">{creator.name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-[10px] font-black uppercase tracking-widest leading-none">
                      Creator Studio
                    </span>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold px-2 py-0 h-4">
                      Top Creator
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-1 leading-tight">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">{creator.name.split(' ')[0]}</span>
                  </h1>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                  <Zap className="h-5 w-5 text-emerald-300" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-white/40 leading-none">Productivity Pulse</span>
                    <span className="text-xl font-mono tabular-nums font-bold leading-tight">{projectsInProgress} Active</span>
                  </div>
                </div>
                <p className="opacity-70 text-sm leading-relaxed border-l-2 border-white/20 pl-4 py-1 max-w-xs">
                  Your creative output is the engine of our success. Monitor your pipeline below.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <Button variant="outline" className="h-12 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xl border-none shadow-lg active:scale-95 transition-all text-base font-bold" onClick={() => router.push(`/creator/${creator.id}/settings`)}>
                <Settings className="mr-2 h-5 w-5" /> Profile Settings
              </Button>
              <Button className="h-12 bg-white text-emerald-700 hover:bg-emerald-50 hover:scale-105 transition-transform font-black shadow-xl shadow-emerald-900/10 text-base" onClick={() => router.push(`/creator/${creator.id}/tasks`)}>
                <ListChecks className="mr-2 h-5 w-5" /> Task Board
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Lifetime Earnings"
            value={`₹${(totalEarnings || 0).toLocaleString()}`}
            icon={<INRIcon className="h-6 w-6 text-emerald-500" />}
            className="glass-card border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40"
          />
          <MetricCard
            title="In Production"
            value={projectsInProgress}
            icon={<Clock className="h-6 w-6 text-blue-500" />}
            className="glass-card border-blue-500/20 shadow-blue-500/5 hover:border-blue-500/40"
          />
          <MetricCard
            title="Total Milestones"
            value={completedProjects}
            icon={<CheckCircle2 className="h-6 w-6 text-indigo-500" />}
            className="glass-card border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/40"
          />
        </div>

        <Achievements
          taskCount={completedProjects}
          moneyValue={totalEarnings}
          type="creator"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Workload Donut */}
          <div className="lg:col-span-4">
            <Card className="glass-card border-white/20 shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" /> Workload Mix
                </CardTitle>
                <CardDescription>Current task distribution</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-6">
                <DonutChart
                  data={[
                    { label: 'Pending', value: creatorTasks.filter(t => t.workStatus === 'Pending').length, color: '#f59e0b' },
                    { label: 'Working', value: projectsInProgress, color: '#3b82f6' },
                    { label: 'Done', value: completedProjects, color: '#10b981' },
                  ]}
                  size={180}
                  strokeWidth={20}
                />
              </CardContent>
            </Card>
          </div>

          {/* Timeline View */}
          <div className="lg:col-span-8">
            <Card className="glass-card border-white/20 shadow-xl overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CalendarCheck2 className="h-5 w-5 text-emerald-500" /> Task Timeline
                    </CardTitle>
                    <CardDescription>Critical upcoming milestones</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/creator/${creator.id}/tasks`)} className="text-xs">
                    View Full Board <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 px-6 pb-6">
                <div className="space-y-4">
                  {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((task, idx) => (
                    <div key={task.id} className="flex items-start gap-4 group cursor-pointer" onClick={() => router.push(`/creator/${creator.id}/tasks/${task.id}`)}>
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${new Date(task.submissionDate) < new Date() ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/5' :
                          task.workStatus === 'In Progress' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/5' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-amber-500/5'
                          }`}>
                          {new Date(task.submissionDate) < new Date() ? <Zap className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        {idx !== upcomingDeadlines.length - 1 && (
                          <div className="absolute top-10 left-1/2 -ml-px h-6 w-0.5 bg-border/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{task.projectName}</h4>
                          <span className="text-[10px] font-mono whitespace-nowrap px-2 py-0.5 bg-secondary rounded-md">{new Date(task.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate opacity-80">Client: {task.clientName}</span>
                          <span className="text-xs text-muted-foreground/30">•</span>
                          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{task.workStatus}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 flex flex-col items-center gap-3">
                      <div className="p-4 bg-secondary/30 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-medium">All tasks cleared. Relax for a bit!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}
