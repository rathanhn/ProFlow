
import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getClient, getTasksByClientId } from '@/lib/firebase-service';
import { Task, Client } from '@/lib/types';
import ClientProjectsTable from '../ClientProjectsTable';

const statusColors: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  Partial: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Unpaid: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  Completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
};


export default async function ClientProjectsPage({ params }: { params: { id: string } }) {
  const rawClient = await getClient(params.id);

  if (!rawClient) {
    notFound();
  }
  
  const client = JSON.parse(JSON.stringify(rawClient)) as Client;
  const rawClientTasks = await getTasksByClientId(params.id);

  const clientTasks = JSON.parse(JSON.stringify(rawClientTasks)) as Task[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Your Projects</h1>
          <p className="text-muted-foreground">An overview of all your projects and their current status.</p>
        </div>
        <ClientProjectsTable tasks={clientTasks} statusColors={statusColors} clientId={client.id} />
      </div>
    </DashboardLayout>
  );
}
