
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTask, getClient } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task, Client } from '@/lib/types';
import AdminActions from './AdminActions';
import TaskDetails from '@/components/TaskDetails';

interface TaskDetailsPageProps {
  params: { id: string };
}

export default async function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const id = params.id as string;
  const rawTask = await getTask(id);

  if (!rawTask) {
    notFound();
  }

  const task = JSON.parse(JSON.stringify(rawTask)) as Task;
  
  const rawClient = await getClient(task.clientId);
  const client = rawClient ? JSON.parse(JSON.stringify(rawClient)) as Client : null;


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="outline" asChild>
                <Link href="/admin/tasks">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Tasks
                </Link>
            </Button>
            <Button asChild>
                <Link href={`/admin/tasks/${task.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Task
                </Link>
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                    {client && (
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={client.avatar} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div>
                        <CardTitle className="text-2xl">{task.projectName}</CardTitle>
                        <CardDescription>
                            Task ID: {task.id} &middot; For {task.clientName}
                        </CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <TaskDetails task={task} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <AdminActions task={task}/>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
