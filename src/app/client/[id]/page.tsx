
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
    ArrowRight
} from 'lucide-react';
import { getClient, getTasksByClientId } from '@/lib/firebase-service';
import { Task, Client } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';


export default async function ClientDashboardPage({ params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`[ClientDashboardPage] Rendering for client ID: ${id}`);
  
  const rawClient = await getClient(id);

  if (!rawClient) {
    console.error(`[ClientDashboardPage] Client not found for ID: ${id}`);
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

  const totalSpent = clientTasks.reduce((acc, task) => acc + (task.amountPaid || 0), 0);
  const outstandingBalance = clientTasks.reduce((acc, task) => acc + ((task.total || 0) - (task.amountPaid || 0)), 0);
  const projectsInProgress = clientTasks.filter(t => t.workStatus === 'In Progress').length;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={client.avatar} />
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
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>A brief look at your most recent projects.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {clientTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">{task.projectName}</p>
                            <p className="text-sm text-muted-foreground">{task.workStatus}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/client/${client.id}/projects/${task.id}`}>
                                View
                            </Link>
                        </Button>
                    </div>
                ))}
            </div>
             <div className="mt-4 pt-4 border-t">
                <Button variant="secondary" className="w-full" asChild>
                   <Link href={`/client/${client.id}/projects`}>View All Projects <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
