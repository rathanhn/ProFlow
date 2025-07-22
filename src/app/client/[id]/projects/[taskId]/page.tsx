import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tasks, clients } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React from 'react';

const statusColors = {
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

export default function ProjectDetailsPage({ params }: { params: { id: string; taskId: string } }) {
  const { id, taskId } = params;
  const client = clients.find(c => c.id === id);
  const task = tasks.find(t => t.id === taskId && t.clientId === id);

  if (!task || !client) {
    notFound();
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
