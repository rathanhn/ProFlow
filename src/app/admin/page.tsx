
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
    File,
    PlusCircle,
    DollarSign,
    ListChecks,
    Users,
    BellRing,
    ArrowRight,
    MessageSquareWarning
} from 'lucide-react';
import { getTasks, getClients, getAdminNotifications } from '@/lib/firebase-service';
import EarningsChart from '@/components/EarningsChart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AIInsights from './AIInsights';


export default async function AdminDashboardPage() {
  const rawTasks = await getTasks();
  const clients = await getClients();
  const unreadNotifications = await getAdminNotifications();

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
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link href="/admin/export">
                        <File className="mr-2 h-4 w-4" /> Export
                    </Link>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/admin/tasks/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                    </Link>
                </Button>
            </div>
        </div>

        {unreadNotifications.length > 0 && (
          <Alert variant="destructive">
            <MessageSquareWarning className="h-4 w-4" />
            <AlertTitle>Important Alerts!</AlertTitle>
            <AlertDescription>
              You have unread messages from clients. Please check your notifications.
              <ul className="mt-2 list-disc list-inside">
                {unreadNotifications.map(notification => (
                  <li key={notification.id}>
                    <Link href={notification.link} className="font-semibold underline">
                      {notification.message}
                    </Link>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(totalEarnings || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Based on fully paid projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(pendingPayments || 0).toLocaleString()}</div>
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
            <EarningsChart />
            <AIInsights tasks={tasks} clients={clients} />
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>A brief look at the most recent projects.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{task.projectName}</p>
                                <p className="text-sm text-muted-foreground">{task.clientName}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/tasks/${task.id}`}>
                                    View
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 pt-4 border-t">
                    <Button variant="secondary" className="w-full" asChild>
                       <Link href="/admin/tasks">View All Tasks <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
