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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
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
      const completedTasks = tasks.filter(t => t.workStatus === 'completed').length;
      const activeTasks = tasks.filter(t => 
        ['pending', 'in-progress', 'under-review'].includes(t.workStatus)
      ).length;
      
      const overdueTasks = tasks.filter(t => {
        if (t.workStatus === 'completed') return false;
        return new Date(t.submissionDate) < now;
      }).length;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const averageTaskValue = totalTasks > 0 ? totalRevenue / totalTasks : 0;

      // Client calculations
      const totalClients = clients.length;
      const activeClients = clients.filter(client => {
        return tasks.some(task => 
          task.clientId === client.id && 
          ['pending', 'in-progress', 'under-review'].includes(task.workStatus)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">Business insights and performance metrics</p>
            </div>
            <Button disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Failed to load analytics</h3>
            <p className="text-muted-foreground mb-4">Unable to fetch analytics data</p>
            <Button onClick={loadAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 fab-safe-bottom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Business insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                </div>
                <INRIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.monthlyRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.monthlyGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${analytics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(Math.abs(analytics.monthlyGrowth))}
                    </span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{analytics.totalTasks}</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.completedTasks} completed
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                  <p className="text-2xl font-bold">{analytics.activeClients}</p>
                  <p className="text-sm text-muted-foreground">
                    of {analytics.totalClients} total
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Task Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <Badge variant="secondary">{formatPercentage(analytics.completionRate)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Task Value</span>
                <span className="text-sm font-semibold">{formatCurrency(analytics.averageTaskValue)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Completed
                  </span>
                  <span>{analytics.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Active
                  </span>
                  <span>{analytics.activeTasks}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Overdue
                  </span>
                  <span>{analytics.overdueTasks}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800">Revenue Growth</h4>
                <p className="text-sm text-green-700">
                  {analytics.monthlyGrowth >= 0 ? 'Increased' : 'Decreased'} by {formatPercentage(Math.abs(analytics.monthlyGrowth))} this month
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800">Task Efficiency</h4>
                <p className="text-sm text-blue-700">
                  {formatPercentage(analytics.completionRate)} completion rate across all projects
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800">Client Engagement</h4>
                <p className="text-sm text-purple-700">
                  {analytics.activeClients} out of {analytics.totalClients} clients have active projects
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
