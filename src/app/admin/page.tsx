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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    BarChart as BarChartIcon,
    File,
    Filter,
    MoreHorizontal,
    PlusCircle,
    Search,
    DollarSign,
    ListChecks,
    Users
} from 'lucide-react';
import { clients, tasks } from '@/lib/data';
import { Task } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import EarningsChart from '@/components/EarningsChart';


const statusColors = {
  Paid: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  Partial: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Unpaid: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  Completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
};

export default function AdminDashboardPage() {
  const totalEarnings = tasks.filter(t => t.paymentStatus === 'Paid').reduce((acc, task) => acc + task.total, 0);
  const pendingPayments = tasks.filter(t => t.paymentStatus !== 'Paid').reduce((acc, task) => acc + task.total, 0);
  const completedProjects = tasks.filter(t => t.workStatus === 'Completed').length;
  const totalClients = clients.length;

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingPayments.toLocaleString()}</div>
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

        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>Manage all your client projects.</CardDescription>
            <div className="flex items-center gap-2 pt-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search tasks..." className="pl-8" />
                </div>
                <Button variant="outline" className="shrink-0">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Project Name</TableHead>
                  <TableHead>Work Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                  <TableHead className="hidden md:table-cell">Submission Date</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task: Task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                           <AvatarImage src={`https://placehold.co/32x32.png`} data-ai-hint={clients.find(c => c.id === task.clientId)?.dataAiHint} alt="Avatar" />
                           <AvatarFallback>{task.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <p className="font-medium">{task.clientName}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{task.projectName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{task.projectName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[task.workStatus]}>
                        {task.workStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[task.paymentStatus]}>
                        {task.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">${task.total.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(task.submissionDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/tasks/${task.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/tasks/${task.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
