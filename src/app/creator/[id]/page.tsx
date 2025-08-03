import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import { Assignee, Task } from '@/lib/types';
import CreatorDashboardClient from './CreatorDashboardClient';

export default async function CreatorDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawCreator = await getAssignee(id);

  if (!rawCreator) {
    notFound();
  }

  const creator = JSON.parse(JSON.stringify(rawCreator)) as Assignee;
  const rawCreatorTasks = await getTasksByAssigneeId(id);
  const creatorTasks = JSON.parse(JSON.stringify(rawCreatorTasks)) as Task[];

  return (
    <DashboardLayout>
      <CreatorDashboardClient 
        initialCreator={creator}
        initialTasks={creatorTasks}
      />
    </DashboardLayout>
  );
}
