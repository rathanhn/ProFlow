
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
    Clock
} from 'lucide-react';
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { Assignee, Task } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type Props = {
    params: { id: string };
};

export default async function CreatorDashboardPage({ params }: Props) {
  const creatorId = params.id;

  if (!creatorId) {
    notFound();
  }

  const rawCreator = await getAssignee(creatorId);

  if (!rawCreator) {
    notFound();
  }
  const creator = JSON.parse(JSON.stringify(rawCreator)) as Assignee;

  const rawCreatorTasks = await getTasksByAssigneeId(creatorId);
  const creatorTasks = JSON.parse(JSON.stringify(rawCreatorTasks)) as Task[];


  const projectsInProgress = creatorTasks.filter(t => t.workStatus === 'In Progress').length;
  const completedProjects = creatorTasks.filter(t => t.workStatus === 'Completed').length;
  
  const totalEarnings = creatorTasks
    .filter(task => task.paymentStatus === 'Paid')
    .reduce((acc, task) => acc + (task.total || 0), 0);

  const upcomingDeadlines = creatorTasks
    .filter(task => task.workStatus !== 'Completed')
    .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime())
    .slice(0, 5);


  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                <Button variant="secondary" className="w-full" asChild>
                   <Link href={`/creator/${creator.id}/tasks`}>View All Tasks <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
