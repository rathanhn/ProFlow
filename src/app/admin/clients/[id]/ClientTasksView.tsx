'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Edit,
  Plus,
  Mail,
  Phone,
  DollarSign,
  Printer
} from 'lucide-react';
import { Client, Task, Assignee } from '@/lib/types';
import TaskList from '@/components/TaskList';
import ExportDialog from '@/components/ExportDialog';

interface ClientTasksViewProps {
  client: Client;
  tasks: Task[];
  assignees?: Assignee[];
}

export default function ClientTasksView({ client, tasks, assignees = [] }: ClientTasksViewProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Details</h1>
            <p className="text-muted-foreground">View all tasks and information for this client</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportDialog
            baseUrl={`/admin/clients/${client.id}/report`}
            assignees={assignees}
          />
          <Link href={`/admin/clients/${client.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </Button>
          </Link>
          <Link href={`/admin/tasks/new?clientId=${client.id}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback className="text-2xl">{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{client.name}</h2>
                <div className="flex flex-col sm:flex-row gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.defaultRate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Default Rate: ₹{client.defaultRate}/page</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <TaskList
        tasks={tasks}
        title={`${client.name}'s Tasks`}
        showClient={false}
        showAddButton={true}
        addButtonLink={`/admin/tasks/new?clientId=${client.id}`}
        emptyStateMessage="No tasks found"
        emptyStateDescription={`${client.name} doesn't have any tasks yet.`}
      />
    </div>
  );
}
