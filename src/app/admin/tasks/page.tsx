
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
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="relative">
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold tracking-tight text-gradient-gemini mb-2">
              All Tasks
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage and track all tasks across all clients with real-time updates.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border-white/20 dark:border-white/10">
          <TaskList
            tasks={tasks}
            title="Task Overview"
            showClient={true}
            showAddButton={true}
            addButtonLink="/admin/tasks/new"
            emptyStateMessage="No tasks found"
            emptyStateDescription="Start by creating your first task or importing tasks from a client."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
