
'use client';

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
import {
    ListChecks,
    ArrowRight,
    CheckCircle2,
    DollarSign,
    Clock,
    Plus,
    Settings,
    FileText
} from 'lucide-react';
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { Assignee, Task } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';

export default function CreatorDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const [creatorId, setCreatorId] = useState<string>('');
  const [creator, setCreator] = useState<Assignee | null>(null);
  const [creatorTasks, setCreatorTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const haptic = useHapticFeedback();
  const router = useRouter();

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
      const rawCreator = await getAssignee(creatorId);
      if (!rawCreator) {
        notFound();
        return;
      }

      const [rawCreatorTasks] = await Promise.all([
        getTasksByAssigneeId(creatorId)
      ]);

      setCreator(JSON.parse(JSON.stringify(rawCreator)) as Assignee);
      setCreatorTasks(JSON.parse(JSON.stringify(rawCreatorTasks)) as Task[]);
    } catch (error) {
      console.error('Failed to load data:', error);
      haptic.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (creatorId) {
      loadData();
    }
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


  const projectsInProgress = creatorTasks.filter(t => t.workStatus === 'In Progress').length;
  const completedProjects = creatorTasks.filter(t => t.workStatus === 'Completed').length;
  
  const totalEarnings = creatorTasks
    .filter(task => task.paymentStatus === 'Paid')
    .reduce((acc, task) => acc + (task.total || 0), 0);

  const upcomingDeadlines = creatorTasks
    .filter(task => task.workStatus !== 'Completed')
    .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime())
    .slice(0, 5);

  const fabActions = [
    {
      id: 'tasks',
      label: 'View Tasks',
      icon: ListChecks,
      onClick: () => {
        haptic.androidClick();
        router.push(`/creator/${creatorId}/tasks`);
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => {
        haptic.androidClick();
        router.push(`/creator/${creatorId}/settings`);
      },
    },
  ];

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6 fab-safe-bottom">
          <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={creator.avatar} />
                  <AvatarFallback className="text-2xl">{creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                  <h1 className="text-3xl font-bold tracking-tight">{creator.name}</h1>
                  <p className="text-muted-foreground">Welcome to your creator dashboard.</p>
              </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From all paid projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects in Progress</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsInProgress}</div>
              <p className="text-xs text-muted-foreground">{creatorTasks.length} total assigned projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
               <p className="text-xs text-muted-foreground">Across all time</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Your next set of tasks to focus on.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(task => (
                    <div key={task.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">{task.projectName}</p>
                            <p className="text-sm text-muted-foreground">Client: {task.clientName}</p>
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
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines. Great work!</p>
                )}
            </div>
             <div className="mt-4 pt-4 border-t">
                <RippleButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    haptic.androidClick();
                    router.push(`/creator/${creator.id}/tasks`);
                  }}
                >
                  View All Tasks <ArrowRight className="ml-2 h-4 w-4" />
                </RippleButton>
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
