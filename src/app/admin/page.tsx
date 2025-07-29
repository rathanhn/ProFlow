
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
    DollarSign,
    ListChecks,
    Users,
    BellRing,
    ArrowRight,
    MessageSquareWarning,
    Clock,
    Plus,
    UserPlus,
    FileText
} from 'lucide-react';
import { getTasks, getClients, getAdminNotifications } from '@/lib/firebase-service';
import EarningsChart from '@/components/EarningsChart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AIInsights from './AIInsights';
import { Client, Task } from '@/lib/types';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function AdminDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const haptic = useHapticFeedback();
  const router = useRouter();

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
        <div className="space-y-6 fab-safe-bottom">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">An overview of all client projects and finances.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <RippleButton
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    haptic.androidClick();
                    router.push('/admin/export');
                  }}
                >
                  <File className="mr-2 h-4 w-4" /> Export
                </RippleButton>
                <RippleButton
                  className="w-full sm:w-auto"
                  onClick={() => {
                    haptic.androidClick();
                    router.push('/admin/tasks/new');
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </RippleButton>
            </div>
        </div>

        {unreadNotifications.length > 0 && (
          <Alert variant="destructive">
            <MessageSquareWarning className="h-4 w-4" />
            <AlertTitle>Important Alerts!</AlertTitle>
            <AlertDescription>
              You have unread messages from clients. Please check your notifications.
              <ul className="mt-2 list-disc list-inside">
                {unreadNotifications.map(notification => (
                  <li key={notification.id}>
                    <Link href={notification.link} className="font-semibold underline">
                      {notification.message}
                    </Link>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {paidButNotCompletedTasks.length > 0 && (
          <Alert>
            <BellRing className="h-4 w-4" />
            <AlertTitle>Action Required!</AlertTitle>
            <AlertDescription>
              The following projects have been paid for but their work status is not yet &apos;Completed&apos;. Please review and update their status.
              <ul className="mt-2 list-disc list-inside">
                {paidButNotCompletedTasks.map(task => (
                  <li key={task.id}>
                    <Link href={`/admin/tasks/${task.id}`} className="font-semibold underline">
                      {task.projectName}
                    </Link>
                    {' '}for {task.clientName} (Work Status: {task.workStatus})
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(totalEarnings || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Based on fully paid projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(pendingPayments || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all unpaid/partial projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{completedProjects}</div>
              <p className="text-xs text-muted-foreground">{tasks.length} total projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">Active and past clients</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
            <EarningsChart />
            <AIInsights tasks={tasks} clients={clients} />
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>These projects are next on the timeline.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(task => (
                        <div key={task.id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{task.projectName}</p>
                                <p className="text-sm text-muted-foreground">{task.clientName}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {new Date(task.submissionDate).toLocaleDateString()}
                               </p>
                               <p className="text-xs text-muted-foreground">{task.workStatus}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines. All projects are completed!</p>
                    )}
                </div>
                 <div className="mt-4 pt-4 border-t">
                    <Button variant="secondary" className="w-full" asChild>
                       <Link href="/admin/tasks">View All Tasks <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </CardContent>
        </Card>

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
