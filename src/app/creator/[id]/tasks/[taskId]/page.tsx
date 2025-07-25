
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTask, getAssignee, getClient } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TaskDetails from '@/components/TaskDetails';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default async function CreatorTaskDetailsPage({ params }: { params: { id: string; taskId: string } }) {
  const { id, taskId } = params;

  const task = await getTask(taskId);
  const creator = await getAssignee(id);

  if (!task || !creator || task.assigneeId !== creator.id) {
    notFound();
  }
  
  const client = await getClient(task.clientId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
                <Link href={`/creator/${creator.id}/tasks`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Your Tasks
                </Link>
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{task.projectName}</CardTitle>
                <CardDescription>
                    Project ID: {task.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskDetails task={task} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {client && (
                <Card>
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                        <CardDescription>Details for the project client.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={client.avatar} />
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{client.name}</p>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Future Actions Card can go here */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
