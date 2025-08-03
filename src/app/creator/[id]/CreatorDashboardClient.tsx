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
import { Badge } from '@/components/ui/badge';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { RippleButton } from '@/components/ui/ripple-effect';
import { useHapticFeedback } from '@/lib/haptic-feedback';

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

  const fabActions = [
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      onClick: () => {
        haptic.androidClick();
        router.push(`/creator/${creator.id}/settings`);
      },
    },
  ];

  return (
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <div key={task.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{task.projectName}</p>
                    <p className="text-sm text-muted-foreground truncate">Client: {task.clientName}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.workStatus}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(task.submissionDate).toLocaleDateString()}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/creator/${creator.id}/tasks/${task.id}`}>
                        View Task
                      </Link>
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming deadlines. Great work!</p>
                </div>
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

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        position="bottom-right"
        size="default"
      />
    </PullToRefresh>
  );
}
