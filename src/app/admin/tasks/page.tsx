
import DashboardLayout from '@/components/DashboardLayout';
import { getTasks, getClients } from '@/lib/firebase-service';
import TaskList from '@/components/TaskList';
import { Client, Task } from '@/lib/types';

export default async function AdminTasksPage() {
  const rawTasks = await getTasks();
  const rawClients = await getClients();

  // Serialize data
  const tasks = JSON.parse(JSON.stringify(rawTasks)) as Task[];
  const clients = JSON.parse(JSON.stringify(rawClients)) as Client[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track all tasks across all clients
          </p>
        </div>
        <TaskList
          tasks={tasks}
          title="All Tasks"
          showClient={true}
          showAddButton={true}
          addButtonLink="/admin/tasks/new"
          emptyStateMessage="No tasks found"
          emptyStateDescription="Start by creating your first task or importing tasks from a client."
        />
      </div>
    </DashboardLayout>
  );
}
