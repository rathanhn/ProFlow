
import DashboardLayout from '@/components/DashboardLayout';
import { getTasks, getClients } from '@/lib/firebase-service';
import TasksTable from '@/app/admin/TasksTable';

export default async function AdminTasksPage() {
  const rawTasks = await getTasks();
  const clients = await getClients();

  // Serialize task dates
  const tasks = rawTasks.map(task => ({
    ...JSON.parse(JSON.stringify(task)), // Ensure plain object
    acceptedDate: new Date(task.acceptedDate).toISOString(),
    submissionDate: new Date(task.submissionDate).toISOString(),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TasksTable tasks={tasks} clients={clients} />
      </div>
    </DashboardLayout>
  );
}
