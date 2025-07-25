
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
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import CreatorTasksTable from './CreatorTasksTable';


const statusColors: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  Partial: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Unpaid: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  Completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
};


export default async function CreatorTasksPage({ params }: { params: { id: string } }) {
  const creator = await getAssignee(params.id);

  if (!creator) {
    notFound();
  }
  
  const creatorTasks = await getTasksByAssigneeId(params.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Your Assigned Tasks</CardTitle>
            <CardDescription>An overview of all your tasks and their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatorTasksTable tasks={creatorTasks} statusColors={statusColors} creatorId={creator.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
