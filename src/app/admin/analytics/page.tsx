'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Zap,
  Activity,
  Award,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INRIcon } from '@/components/ui/inr-icon';
import { getClients, getTasks, getTransactions } from '@/lib/firebase-service';

interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  totalClients: number;
  activeClients: number;
  averageTaskValue: number;
  completionRate: number;
  monthlyGrowth: number;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [clients, tasks, transactions] = await Promise.all([
        getClients(),
        getTasks(),
        getTransactions()
      ]);

      // Calculate analytics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Revenue calculations
      const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const monthlyTransactions = transactions.filter(t =>
        new Date(t.transactionDate) >= thirtyDaysAgo
      );
      const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      const previousMonthTransactions = transactions.filter(t => {
        const date = new Date(t.transactionDate);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      });
      const previousMonthRevenue = previousMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      const monthlyGrowth = previousMonthRevenue > 0
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      // Task calculations
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.workStatus === 'Completed').length;
      const activeTasks = tasks.filter(t =>
        ['Pending', 'In Progress'].includes(t.workStatus)
      ).length;

      const overdueTasks = tasks.filter(t => {
        if (t.workStatus === 'Completed') return false;
        return new Date(t.submissionDate) < now;
      }).length;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const averageTaskValue = totalTasks > 0 ? totalRevenue / totalTasks : 0;

      // Client calculations
      const totalClients = clients.length;
      const activeClients = clients.filter(client => {
        return tasks.some(task =>
          task.clientId === client.id &&
          ['Pending', 'In Progress'].includes(task.workStatus)
        );
      }).length;

      setAnalytics({
        totalRevenue,
        monthlyRevenue,
        totalTasks,
        completedTasks,
        activeTasks,
        overdueTasks,
        totalClients,
        activeClients,
        averageTaskValue,
        completionRate,
        monthlyGrowth
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-[200px] w-full bg-blue-600/10 rounded-[2.5rem] animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[400px] bg-white/5 border border-white/10 rounded-[2.5rem] animate-pulse" />
            <div className="h-[400px] bg-white/5 border border-white/10 rounded-[2.5rem] animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-xl">⚠️</div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Telemetry Failure</h3>
            <p className="text-muted-foreground max-w-xs mx-auto font-medium">Unable to establish connection with the analytics engine. Please re-run the process.</p>
            <Button onClick={loadAnalytics} className="rounded-full px-8">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-Sync Telemetry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 fab-safe-bottom">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BarChart3 className="h-64 w-64 rotate-12" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 font-black uppercase tracking-[0.2em] text-[10px]">
                  Business Intelligence v2.0
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                  Enterprise <span className="text-blue-500">Analytics</span>
                </h1>
                <p className="text-slate-400 font-medium max-w-lg">
                  Real-time telemetry and project performance metrics for the entire coordination network.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-md">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40 bg-transparent border-0 focus:ring-0 text-sm font-bold uppercase tracking-tight">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last quarter</SelectItem>
                    <SelectItem value="1y">Full Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={loadAnalytics}
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">System Live</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Data Synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-white/20 shadow-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <INRIcon className="h-24 w-24" />
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <INRIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Total Revenue</p>
                  <p className="text-3xl font-black tabular-nums tracking-tighter">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 shadow-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <TrendingUp className="h-24 w-24" />
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Monthly Flow</p>
                    <div className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black",
                      analytics.monthlyGrowth >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {analytics.monthlyGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {formatPercentage(Math.abs(analytics.monthlyGrowth))}
                    </div>
                  </div>
                  <p className="text-3xl font-black tabular-nums tracking-tighter">{formatCurrency(analytics.monthlyRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 shadow-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <FileText className="h-24 w-24" />
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Task Volume</p>
                  <p className="text-3xl font-black tabular-nums tracking-tighter">{analytics.totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 shadow-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Users className="h-24 w-24" />
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Partner Network</p>
                  <p className="text-3xl font-black tabular-nums tracking-tighter">{analytics.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card border-white/20 shadow-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-blue-500" />
                Performance Telemetry
              </CardTitle>
              <CardDescription>Mission success and completion benchmarks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Completion Velocity</span>
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black">{formatPercentage(analytics.completionRate)}</Badge>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000" style={{ width: `${analytics.completionRate}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 rounded-3xl bg-white/5 border border-white/10">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                  <p className="text-lg font-black">{analytics.completedTasks}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60">Finished</p>
                </div>
                <div className="text-center p-4 rounded-3xl bg-white/5 border border-white/10">
                  <Clock className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-lg font-black">{analytics.activeTasks}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60">Active</p>
                </div>
                <div className="text-center p-4 rounded-3xl bg-white/5 border border-white/10">
                  <AlertCircle className="h-5 w-5 text-rose-500 mx-auto mb-2" />
                  <p className="text-lg font-black">{analytics.overdueTasks}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60">Critical</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Avg Mission Value</p>
                    <p className="text-sm font-black">{formatCurrency(analytics.averageTaskValue)}</p>
                  </div>
                </div>
                <div className="h-10 w-24 rounded-full bg-blue-500/10 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 shadow-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Award className="h-5 w-5 text-yellow-500" />
                Network Insights
              </CardTitle>
              <CardDescription>Strategic observations from active telemetry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 group hover:border-emerald-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight mb-1 text-emerald-100">Revenue Growth Stable</h4>
                    <p className="text-xs text-emerald-100/60 leading-relaxed font-medium">
                      The coordination network has achieved a {formatPercentage(Math.abs(analytics.monthlyGrowth))} {analytics.monthlyGrowth >= 0 ? 'increase' : 'fluctuation'} in fiscal volume over the last 30 operational days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 group hover:border-blue-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight mb-1 text-blue-100">System Efficiency</h4>
                    <p className="text-xs text-blue-100/60 leading-relaxed font-medium">
                      Protocol maintenance reporting shows a {formatPercentage(analytics.completionRate)} success rate across the grid, indicating high operational stability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 group hover:border-purple-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight mb-1 text-purple-100">Network Density</h4>
                    <p className="text-xs text-purple-100/60 leading-relaxed font-medium">
                      Currently, {analytics.activeClients} partners are actively deploying missions, maintaining a steady workload across {analytics.activeTasks} nodes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
