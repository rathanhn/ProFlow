
'use client';

import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTask, getClient } from '@/lib/firebase-service';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React, { useEffect, useState } from 'react';
import { Task, Client } from '@/lib/types';

const statusColors: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  Partial: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Unpaid: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  Completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="font-medium text-right">{value}</dd>
    </div>
);

export default function ProjectDetailsPage() {
  const params = useParams();
  const { id, taskId } = params as { id: string; taskId: string };
  const [task, setTask] = useState<Task | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (id && taskId) {
      const fetchDetails = async () => {
        const taskData = await getTask(taskId);
        const clientData = await getClient(id);
        
        if (!taskData || !clientData || taskData.clientId !== clientData.id) {
          notFound();
        }
        
        setTask(JSON.parse(JSON.stringify(taskData)));
        setClient(JSON.parse(JSON.stringify(clientData)));
      };
      fetchDetails();
    }
  }, [id, taskId]);

  if (!task || !client) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
                <Link href={`/client/${client.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Your Projects
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{task.projectName}</CardTitle>
            <CardDescription>
                Project ID: {task.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border">
                <DetailItem label="Work Status" value={<Badge variant="outline" className={statusColors[task.workStatus]}>{task.workStatus}</Badge>} />
                <DetailItem label="Payment Status" value={<Badge variant="outline" className={statusColors[task.paymentStatus]}>{task.paymentStatus}</Badge>} />
                <Separator />
                <DetailItem label="Project Start Date" value={new Date(task.acceptedDate).toLocaleDateString()} />
                <DetailItem label="Estimated Completion" value={new Date(task.submissionDate).toLocaleDateString()} />
                <Separator />
                <DetailItem label="Total Cost" value={<span className="text-lg font-bold text-primary">₹{task.total.toLocaleString()}</span>} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
