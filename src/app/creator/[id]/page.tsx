
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
    CheckCircle2
} from 'lucide-react';
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { Assignee, Task } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';


export default async function CreatorDashboardPage({ params }: { params: { id: string } }) {
  const creatorId = params.id;

  if (!creatorId) {
    notFound();
  }

  const creator = await getAssignee(creatorId);

  if (!creator) {
    notFound();
  }

  const creatorTasks = await getTasksByAssigneeId(creatorId);

  const projectsInProgress = creatorTasks.filter(t => t.workStatus === 'In Progress').length;
  const completedProjects = creatorTasks.filter(t => t.workStatus === 'Completed').length;

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
            <CardTitle>Your Assigned Tasks</CardTitle>
            <CardDescription>A brief look at your most recent assigned tasks.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {creatorTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">{task.projectName}</p>
                            <p className="text-sm text-muted-foreground">Client: {task.clientName} | Status: {task.workStatus}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/creator/${creator.id}/tasks/${task.id}`}>
                                View
                            </Link>
                        </Button>
                    </div>
                ))}
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
