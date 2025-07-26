
import DashboardLayout from '@/components/DashboardLayout';
import { getTasks, getClients } from '@/lib/firebase-service';
import TasksTable from '@/app/admin/TasksTable';
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
        <TasksTable tasks={tasks} clients={clients} />
      </div>
    </DashboardLayout>
  );
}
