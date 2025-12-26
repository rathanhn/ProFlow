import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getClient, getTasks, getAssignees } from '@/lib/firebase-service';
import { Client, Task, Assignee } from '@/lib/types';
import ClientTasksView from './ClientTasksView';

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  try {
    // Await params first
    const resolvedParams = await params;

    // Fetch client, all tasks, and assignees
    const [rawClient, rawTasks, rawAssignees] = await Promise.all([
      getClient(resolvedParams.id),
      getTasks(),
      getAssignees()
    ]);

    if (!rawClient) {
      notFound();
    }

    // Serialize data
    const client = JSON.parse(JSON.stringify(rawClient)) as Client;
    const allTasks = JSON.parse(JSON.stringify(rawTasks)) as Task[];
    const assignees = JSON.parse(JSON.stringify(rawAssignees)) as Assignee[];

    // Filter tasks for this client
    const clientTasks = allTasks.filter(task => task.clientId === resolvedParams.id);

    return (
      <DashboardLayout>
        <ClientTasksView client={client} tasks={clientTasks} assignees={assignees} />
      </DashboardLayout>
    );
  } catch (error) {
    console.error('Error loading client details:', error);
    notFound();
  }
}
