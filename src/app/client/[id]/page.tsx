
'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ListChecks,
  ArrowRight,
  FileText,
  Settings,
  CreditCard,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { INRIcon } from '@/components/ui/inr-icon';
import { MetricCard, DonutChart } from '@/components/ui/charts';
import { getClient, getTasksByClientId } from '@/lib/firebase-service';
import { Task, Client } from '@/lib/types';
import { ClickableAvatar } from '@/components/ClickableAvatar';
import { Button } from '@/components/ui/button';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import Achievements from '@/components/Achievements';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export default function ClientDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const [clientId, setClientId] = useState<string>('');
  const [client, setClient] = useState<Client | null>(null);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const haptic = useHapticFeedback();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

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
      const rawClient = await getClient(clientId);
      if (!rawClient) {
        notFound();
        return;
      }

      const rawClientTasks = await getTasksByClientId(clientId);

      setClient(JSON.parse(JSON.stringify(rawClient)) as Client);
      setClientTasks(JSON.parse(JSON.stringify(rawClientTasks)) as Task[]);
    } catch (error) {
      console.error('Failed to load data:', error);
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

  if (isLoading || !client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const totalSpent = clientTasks.reduce((acc, task) => acc + (task.amountPaid || 0), 0);
  const outstandingBalance = clientTasks.reduce((acc, task) => acc + ((task.total || 0) - (task.amountPaid || 0)), 0);
  const projectsInProgress = clientTasks.filter(t => t.workStatus === 'In Progress').length;

  const handleProtectedAction = (path: string) => {
    if (!user) {
      toast({
        title: "Access Restricted",
        description: "Please login to verify your identity and access this secure section.",
        action: (
          <Button variant="default" size="sm" onClick={() => router.push('/client-login')} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg h-8">
            Authorize
          </Button>
        ),
      });
      return;
    }
    router.push(path);
  };

  const fabActions = [
    {
      id: 'projects',
      label: 'View Projects',
      icon: ListChecks,
      onClick: () => {
        haptic.androidClick();
        router.push(`/client/${clientId}/projects`);
      },
    },
    ...(user ? [
      {
        id: 'transactions',
        label: 'Transactions',
        icon: CreditCard,
        onClick: () => {
          haptic.androidClick();
          handleProtectedAction(`/client/${clientId}/transactions`);
        },
      },
      {
        id: 'export',
        label: 'Export Data',
        icon: FileText,
        onClick: () => {
          haptic.androidClick();
          handleProtectedAction(`/client/${clientId}/export`);
        },
      },
    ] : []),
  ];

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-8 fab-safe-bottom pt-4">

          {/* Premium Hero Section */}
          <div className="relative overflow-hidden rounded-[2rem] md:rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-700 p-6 md:p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20">
            <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ClickableAvatar
                    src={client.avatar}
                    fallback={client.name.charAt(0)}
                    userName={client.name}
                    userEmail={client.email}
                    size="xl"
                    className="h-16 w-16 border-2 border-white/40 shadow-xl"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-[10px] font-black uppercase tracking-widest leading-none">
                        Partner Workspace
                      </span>
                      <Badge variant="premium" className="px-2 py-0 h-4">
                        Elite Client
                      </Badge>
                    </div>
                    <h1 className="text-2xl md:text-5xl font-black tracking-tighter mt-1 leading-tight whitespace-nowrap overflow-hidden">
                      Greetings, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">{client.name.split(' ')[0]}</span>
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-2">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                    <ListChecks className="h-5 w-5 text-cyan-300" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-white/40 leading-none">Active Projects</span>
                      <span className="text-xl font-mono tabular-nums font-bold leading-tight">{projectsInProgress}</span>
                    </div>
                  </div>
                  <p className="opacity-70 text-sm leading-relaxed border-l-2 border-white/20 pl-4 py-1 max-w-xs">
                    Managing your visual assets and production pipeline with precision.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <Button variant="outline" className="h-12 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xl border-none shadow-lg active:scale-95 transition-all text-base font-bold" onClick={() => handleProtectedAction(`/client/${client.id}/settings`)}>
                  <Settings className="mr-2 h-5 w-5" /> Account Settings
                </Button>
                <Button className="h-12 bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-105 transition-transform font-black shadow-xl shadow-indigo-900/10 text-base" onClick={() => router.push(`/client/${client.id}/projects`)}>
                  <FileText className="mr-2 h-5 w-5" /> All Projects
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Grid - Optimized for Mobile (2 columns) */}
          {user ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              <MetricCard
                title="Investment"
                value={`₹${(totalSpent || 0).toLocaleString()}`}
                icon={<INRIcon className="h-6 w-6 text-indigo-500" />}
                className="glass-card border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/40"
              />
              <MetricCard
                title="Pending"
                value={`₹${(outstandingBalance || 0).toLocaleString()}`}
                icon={<CreditCard className="h-6 w-6 text-cyan-500" />}
                className="glass-card border-cyan-500/20 shadow-cyan-500/5 hover:border-cyan-500/40"
              />
              <MetricCard
                title="Deliveries"
                value={clientTasks.filter(t => t.workStatus === 'Completed').length}
                icon={<CalendarCheck2 className="h-6 w-6 text-emerald-500" />}
                className="glass-card border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              <MetricCard
                title="Production"
                value={`${Math.round((clientTasks.filter(t => t.workStatus === 'Completed').length / (clientTasks.length || 1)) * 100)}%`}
                icon={<Zap className="h-6 w-6 text-yellow-500" />}
                className="glass-card border-yellow-500/20 shadow-yellow-500/5"
              />
              <MetricCard
                title="Milestones"
                value={clientTasks.filter(t => t.workStatus === 'Completed').length}
                icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                className="glass-card border-emerald-500/20 shadow-emerald-500/5"
              />
              <MetricCard
                title="Pipeline"
                value={clientTasks.length}
                icon={<ListChecks className="h-6 w-6 text-blue-500" />}
                className="glass-card border-blue-500/20 shadow-blue-500/5"
              />
            </div>
          )}

          {user && (
            <Achievements
              taskCount={clientTasks.filter(t => t.workStatus === 'Completed').length}
              moneyValue={totalSpent}
              type="client"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Status Breakdown */}
            <div className="lg:col-span-4">
              <Card className="glass-card border-white/20 shadow-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" /> Pipeline Status
                  </CardTitle>
                  <CardDescription>Live tracking overview</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-6">
                  <DonutChart
                    data={[
                      { label: 'Pending', value: clientTasks.filter(t => t.workStatus === 'Pending').length, color: '#f59e0b' },
                      { label: 'In Progress', value: projectsInProgress, color: '#3b82f6' },
                      { label: 'Completed', value: clientTasks.filter(t => t.workStatus === 'Completed').length, color: '#10b981' },
                    ]}
                    size={180}
                    strokeWidth={20}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Recent Movement */}
            <div className="lg:col-span-8">
              <Card className="glass-card border-white/20 shadow-xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CalendarCheck2 className="h-5 w-5 text-indigo-500" /> Recent Activity
                      </CardTitle>
                      <CardDescription>Latest updates on your workspace</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/client/${client.id}/projects`)} className="text-xs">
                      View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-6 pb-6">
                  <div className="space-y-4">
                    {clientTasks.length > 0 ? clientTasks.slice(0, 5).map((task, idx) => (
                      <div key={task.id} className="flex items-start gap-4 group cursor-pointer" onClick={() => router.push(`/client/${client.id}/projects/${task.id}`)}>
                        <div className="relative">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${task.workStatus === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/5' :
                            task.workStatus === 'In Progress' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-indigo-500/5' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-amber-500/5'
                            }`}>
                            {task.workStatus === 'Completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                          </div>
                          {idx !== Math.min(clientTasks.length, 5) - 1 && (
                            <div className="absolute top-10 left-1/2 -ml-px h-6 w-0.5 bg-border/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.projectName}</h4>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">{task.projectNo}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground truncate opacity-80">Ref: {task.id.slice(0, 6)}</span>
                            <span className="text-xs text-muted-foreground/30">•</span>
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{task.workStatus}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 flex flex-col items-center gap-3">
                        <div className="p-4 bg-secondary/30 rounded-full">
                          <ListChecks className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground font-medium">No projects initiated yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        position="bottom-right"
        size="default"
      />
    </DashboardLayout>
  );
}
