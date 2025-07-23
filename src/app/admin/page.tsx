

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    BarChart as BarChartIcon,
    File,
    PlusCircle,
    DollarSign,
    ListChecks,
    Users,
    BellRing
} from 'lucide-react';
import { getTasks, getClients } from '@/lib/firebase-service';
import EarningsChart from '@/components/EarningsChart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TasksTable from './TasksTable';


export default async function AdminDashboardPage() {
  const rawTasks = await getTasks();
  const clients = await getClients();

  // Serialize task dates
  const tasks = rawTasks.map(task => ({
    ...JSON.parse(JSON.stringify(task)), // Ensure plain object
    acceptedDate: new Date(task.acceptedDate).toISOString(),
    submissionDate: new Date(task.submissionDate).toISOString(),
  }));
  
  const totalEarnings = tasks.filter(t => t.paymentStatus === 'Paid').reduce((acc, task) => acc + (task.total || 0), 0);
  const pendingPayments = tasks.filter(t => t.paymentStatus !== 'Paid').reduce((acc, task) => acc + ((task.total || 0) - (task.amountPaid || 0)), 0);
  const completedProjects = tasks.filter(t => t.workStatus === 'Completed').length;
  const totalClients = clients.length;

  const paidButNotCompletedTasks = tasks.filter(
    (task) => task.paymentStatus === 'Paid' && task.workStatus !== 'Completed'
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">An overview of all client projects and finances.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline">
                    <File className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button asChild>
                    <Link href="/admin/tasks/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                    </Link>
                </Button>
            </div>
        </div>

        {paidButNotCompletedTasks.length > 0 && (
          <Alert>
            <BellRing className="h-4 w-4" />
            <AlertTitle>Action Required!</AlertTitle>
            <AlertDescription>
              The following projects have been paid for but their work status is not yet 'Completed'. Please review and update their status.
              <ul className="mt-2 list-disc list-inside">
                {paidButNotCompletedTasks.map(task => (
                  <li key={task.id}>
                    <Link href={`/admin/tasks/${task.id}`} className="font-semibold underline">
                      {task.projectName}
                    </Link>
                    {' '}for {task.clientName} (Work Status: {task.workStatus})
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Based on fully paid projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{pendingPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all unpaid/partial projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{completedProjects}</div>
              <p className="text-xs text-muted-foreground">{tasks.length} total projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">Active and past clients</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <EarningsChart />
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>AI-Powered Insights</CardTitle>
                    <CardDescription>Ask about your data to get visualizations.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                        <Input placeholder="e.g., 'Show top clients by earnings'" />
                        <Button className="w-full">
                            <BarChartIcon className="mr-2 h-4 w-4" /> Generate Visualization
                        </Button>
                        <div className="mt-4 p-4 border rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                            Your generated chart will appear here.
                        </div>
                   </div>
                </CardContent>
            </Card>
        </div>
        <TasksTable tasks={tasks} clients={clients} />
      </div>
    </DashboardLayout>
  );
}
