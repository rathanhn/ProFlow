
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    DollarSign,
    ListChecks,
} from 'lucide-react';
import { getClient, getTasksByClientId } from '@/lib/firebase-service';
import { Task, Client } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ClientProjectsTable from './ClientProjectsTable';

const statusColors: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  Partial: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Unpaid: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  Completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
};


export default async function ClientDashboardPage({ params }: { params: { id: string } }) {
  const id = params.id as string;
  const rawClient = await getClient(id);

  if (!rawClient) {
    notFound();
  }
  
  // Properly serialize the client object to pass to client components
  const client = JSON.parse(JSON.stringify(rawClient)) as Client;

  const rawClientTasks = await getTasksByClientId(client.id);

  // Properly serialize the tasks array, ensuring all dates are strings
  const clientTasks = rawClientTasks.map(task => ({
    ...JSON.parse(JSON.stringify(task)),
     // Ensure dates are strings, even if they come from Firestore as Timestamps
    acceptedDate: new Date(task.acceptedDate).toISOString(),
    submissionDate: new Date(task.submissionDate).toISOString(),
  })) as Task[];

  const totalSpent = clientTasks.filter(t => t.paymentStatus === 'Paid').reduce((acc, task) => acc + task.total, 0);
  const outstandingBalance = clientTasks.filter(t => t.paymentStatus !== 'Paid').reduce((acc, task) => acc + task.total, 0);
  const projectsInProgress = clientTasks.filter(t => t.workStatus === 'In Progress').length;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={client.avatar} data-ai-hint={client.dataAiHint} />
                <AvatarFallback className="text-2xl">{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                <p className="text-muted-foreground">Welcome to your personal dashboard.</p>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total amount paid for all projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{outstandingBalance.toLocaleString()}</div>
               <p className="text-xs text-muted-foreground">Across all unpaid/partial projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects in Progress</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsInProgress}</div>
              <p className="text-xs text-muted-foreground">{clientTasks.length} total projects with us</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>An overview of all your projects and their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientProjectsTable tasks={clientTasks} statusColors={statusColors} clientId={client.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
