import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getClient, getTasks } from '@/lib/firebase-service';
import { Client, Task } from '@/lib/types';
import ClientTasksView from './ClientTasksView';

interface ClientDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  try {
    // Fetch client and all tasks
    const [rawClient, rawTasks] = await Promise.all([
      getClient(params.id),
      getTasks()
    ]);

    if (!rawClient) {
      notFound();
    }

    // Serialize data
    const client = JSON.parse(JSON.stringify(rawClient)) as Client;
    const allTasks = JSON.parse(JSON.stringify(rawTasks)) as Task[];
    
    // Filter tasks for this client
    const clientTasks = allTasks.filter(task => task.clientId === params.id);

    return (
      <DashboardLayout>
        <ClientTasksView client={client} tasks={clientTasks} />
      </DashboardLayout>
    );
  } catch (error) {
    console.error('Error loading client details:', error);
    notFound();
  }
}
