
'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  File,
  PlusCircle,
  ListChecks,
  Users,
  BellRing,
  ArrowRight,
  MessageSquareWarning,
  Clock,
  Plus,
  UserPlus,
  FileText,
  Sparkles,
  BarChart3,
  Zap,
  CheckCircle2,
  CalendarCheck2,
  Trophy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { INRIcon } from '@/components/ui/inr-icon';
import { getTasks, getClients, getAdminNotifications } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';
import EarningsChart from '@/components/EarningsChart';
import { DonutChart, ProgressRing, MetricCard } from '@/components/ui/charts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AIInsights from './AIInsights';
import { Client, Task, Notification } from '@/lib/types';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const haptic = useHapticFeedback();
  const router = useRouter();
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [rawTasks, rawClients, notifications] = await Promise.all([
        getTasks(),
        getClients(),
        getAdminNotifications()
      ]);

      // Serialize data
      setTasks(JSON.parse(JSON.stringify(rawTasks)) as Task[]);
      setClients(JSON.parse(JSON.stringify(rawClients)) as Client[]);
      setUnreadNotifications(notifications);
    } catch (error) {
      console.error('Failed to load data:', error);
      haptic.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    haptic.androidSwipeRefresh();
    await loadData();
  };

  const totalEarnings = tasks.filter(t => t.paymentStatus === 'Paid').reduce((acc, task) => acc + (task.total || 0), 0);
  const pendingPayments = tasks.filter(t => t.paymentStatus !== 'Paid').reduce((acc, task) => acc + ((task.total || 0) - (task.amountPaid || 0)), 0);
  const completedProjects = tasks.filter(t => t.workStatus === 'Completed').length;
  const totalClients = clients.length;

  const paidButNotCompletedTasks = tasks.filter(
    (task) => task.paymentStatus === 'Paid' && task.workStatus !== 'Completed'
  );

  const upcomingDeadlines = tasks
    .filter(task => task.workStatus !== 'Completed')
    .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime())
    .slice(0, 5);

  const recentActivities = [...tasks]
    .sort((a, b) => new Date(b.acceptedDate).getTime() - new Date(a.acceptedDate).getTime())
    .slice(0, 5);

  // FAB actions
  const fabActions = [
    {
      id: 'new-task',
      label: 'New Task',
      icon: Plus,
      onClick: () => {
        haptic.androidClick();
        router.push('/admin/tasks/new');
      },
    },
    {
      id: 'new-client',
      label: 'New Client',
      icon: UserPlus,
      onClick: () => {
        haptic.androidClick();
        router.push('/admin/clients/new');
      },
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: FileText,
      onClick: () => {
        haptic.androidClick();
        router.push('/admin/export');
      },
    },
  ];

  // Real-time clock and dynamic quote
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState("Focus on being productive instead of busy.");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const quotes = [
      "Focus on being productive instead of busy.",
      "The best way to predict the future is to create it.",
      "Success is not final, failure is not fatal.",
      "Your only limit is your soul.",
      "Do what you can, with what you have, where you are.",
      "Quality is not an act, it is a habit.",
      "Small progress is still progress."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-8 fab-safe-bottom pt-4">

          {/* Welcome Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-blue-500/20">
            <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner">
                    <Sparkles className="h-7 w-7 text-yellow-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-xs font-black uppercase tracking-widest leading-none">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold px-2 py-0 h-4">
                        Premium Partner
                      </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mt-1 leading-tight">
                      Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white">{user?.displayName?.split(' ')[0] || 'Admin'}</span>
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-2">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                    <Clock className="h-5 w-5 text-yellow-300" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-white/40 leading-none">Standard Time</span>
                      <span className="text-xl font-mono tabular-nums font-bold leading-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="max-w-md">
                    <p className="italic opacity-70 text-sm leading-relaxed border-l-2 border-white/20 pl-4 py-1">
                      &quot;{quote}&quot;
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <Button variant="outline" className="h-12 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xl border-none shadow-lg active:scale-95 transition-all text-base font-bold" onClick={() => router.push('/admin/tasks/new')}>
                  <Plus className="mr-2 h-5 w-5" /> Quick Project
                </Button>
                <Button className="h-12 bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 transition-transform font-black shadow-xl shadow-blue-900/10 text-base" onClick={() => router.push('/admin/tasks/report')}>
                  <FileText className="mr-2 h-5 w-5" /> Intelligence Report
                </Button>
              </div>
            </div>
          </div>

          {unreadNotifications.length > 0 && (
            <Alert variant="destructive" className="glass-card border-red-500/50 bg-red-500/5">
              <MessageSquareWarning className="h-4 w-4" />
              <AlertTitle className="font-bold">Urgent Client Messages</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-2">
                  {unreadNotifications.map(notification => (
                    <li key={notification.id} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                      <Link href={notification.link} className="hover:underline transition-all">
                        {notification.message}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Global Total Revenue"
              value={`₹${(totalEarnings || 0).toLocaleString()}`}
              icon={<INRIcon className="h-6 w-6 text-blue-500" />}
              className="glass-card border-blue-500/20 shadow-blue-500/5 hover:border-blue-500/40"
              change={{ value: 12, type: 'increase' }}
            />
            <MetricCard
              title="Pending Invoices"
              value={`₹${(pendingPayments || 0).toLocaleString()}`}
              icon={<Clock className="h-6 w-6 text-orange-500" />}
              className="glass-card border-orange-500/20 shadow-orange-500/5 hover:border-orange-500/40"
            />
            <MetricCard
              title="Project Success"
              value={`+${completedProjects}`}
              icon={<ListChecks className="h-6 w-6 text-emerald-500" />}
              className="glass-card border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40"
              change={{ value: 8, type: 'increase' }}
            />
            <MetricCard
              title="Active Partnerships"
              value={totalClients}
              icon={<Users className="h-6 w-6 text-purple-500" />}
              className="glass-card border-purple-500/20 shadow-purple-500/5 hover:border-purple-500/40"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Row 1: Pulse & Focus */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="glass-card border-white/20 shadow-xl overflow-hidden transition-all hover:shadow-blue-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" /> Project Pulse
                  </CardTitle>
                  <CardDescription>Live telemetry breakdown</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-6 pb-8">
                  <DonutChart
                    data={[
                      { label: 'Pending', value: tasks.filter(t => t.workStatus === 'Pending').length, color: '#f59e0b' },
                      { label: 'In Progress', value: tasks.filter(t => t.workStatus === 'In Progress').length, color: '#3b82f6' },
                      { label: 'Completed', value: completedProjects, color: '#10b981' },
                    ]}
                    size={200}
                    strokeWidth={24}
                  />
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20 shadow-xl overflow-hidden transition-all hover:shadow-amber-500/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" /> Immediate Focus
                  </CardTitle>
                  <CardDescription>Critical upcoming deadlines</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((task) => (
                      <div key={task.id} className="flex items-center justify-between group cursor-pointer" onClick={() => router.push(`/admin/tasks/${task.id}`)}>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black uppercase tracking-tight truncate group-hover:text-blue-500 transition-colors">{task.projectName}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{new Date(task.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest leading-none px-1.5 h-4 ${new Date(task.submissionDate) < new Date() ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          }`}>
                          {new Date(task.submissionDate) < new Date() ? 'Critical' : 'Active'}
                        </Badge>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-[10px] font-black uppercase text-muted-foreground/30 italic">No direct threats detected</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="glass-card border-white/20 shadow-xl overflow-hidden relative min-h-[500px]">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <ListChecks className="h-48 w-48 rotate-12" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CalendarCheck2 className="h-5 w-5 text-blue-500" /> Recent Workflow
                      </CardTitle>
                      <CardDescription>Real-time project activities and state changes</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/admin/tasks')} className="text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
                      Access All Nodes <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-6">
                  <div className="space-y-6">
                    {recentActivities.map((task, idx) => (
                      <div key={task.id} className="flex items-start gap-4 group cursor-pointer relative" onClick={() => router.push(`/admin/tasks/${task.id}`)}>
                        <div className="relative z-10">
                          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 shadow-lg ${task.workStatus === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                            task.workStatus === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                            {task.workStatus === 'Completed' ? <CheckCircle2 className="h-5.5 w-5.5" /> : <Clock className="h-5.5 w-5.5" />}
                          </div>
                          {idx !== recentActivities.length - 1 && (
                            <div className="absolute top-11 left-1/2 -ml-px h-8 w-0.5 bg-gradient-to-b from-border/50 to-transparent" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 bg-white/5 border border-white/10 p-4 rounded-3xl group-hover:bg-white/10 transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-black text-sm truncate group-hover:text-blue-500 transition-colors uppercase tracking-tight">{task.projectName}</h4>
                            <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground border-white/10">{task.projectNo}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{task.clientName}</span>
                            <span className="text-[10px] text-muted-foreground/30">•</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${task.workStatus === 'Completed' ? 'text-emerald-500' :
                              task.workStatus === 'In Progress' ? 'text-blue-500' : 'text-amber-500'
                              }`}>{task.workStatus}</span>
                          </div>
                          <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${task.workStatus === 'Completed' ? 'bg-emerald-500 w-full' :
                                task.workStatus === 'In Progress' ? 'bg-blue-500 w-2/3' : 'bg-amber-500 w-1/3'
                                }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 2: AI Intelligence & Achievement Pulse */}
            <div className="lg:col-span-8">
              <AIInsights tasks={tasks} clients={clients} />
            </div>
            <div className="lg:col-span-4">
              <Card className="glass-card border-white/20 shadow-xl overflow-hidden bg-gradient-to-br from-yellow-500/5 to-transparent h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" /> Achievement Pulse
                  </CardTitle>
                  <CardDescription>Network-wide engagement levels</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Milestones Unlocked</span>
                      <Badge variant="outline" className="text-[10px] font-black">{completedProjects} TOTAL</Badge>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-3/4 animate-pulse" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Most Unlocked</p>
                      <p className="font-black text-sm uppercase">Initiator Node</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">Reward Distribution Active</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {paidButNotCompletedTasks.length > 0 && (
            <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-600">
                  <BellRing className="h-5 w-5 animate-bounce" />
                  Action Required
                </CardTitle>
                <CardDescription>Paid projects that need completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {paidButNotCompletedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{task.projectName}</span>
                        <span className="text-xs text-muted-foreground">{task.clientName}</span>
                      </div>
                      <Badge variant="outline" className="capitalize bg-yellow-100 text-yellow-700 border-yellow-200">
                        {task.workStatus}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/tasks/${task.id}`}>Update <ArrowRight className="ml-1 h-3 w-3" /></Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        position="bottom-right"
        size="default"
      />
    </DashboardLayout >
  );
}
