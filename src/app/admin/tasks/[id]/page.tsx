
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
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, User, Bell, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { Task, Client } from '@/lib/types';
import AdminActions from './AdminActions';

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


export default async function TaskDetailsPage({ params }: { params: { id: string } }) {
  const id = params.id as string;
  const rawTask = await getTask(id);

  if (!rawTask) {
    notFound();
  }

  const task = JSON.parse(JSON.stringify(rawTask)) as Task;
  
  const rawClient = await getClient(task.clientId);
  const client = rawClient ? JSON.parse(JSON.stringify(rawClient)) as Client : null;


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Tasks
                </Link>
            </Button>
            <Button asChild>
                <Link href={`/admin/tasks/${task.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Task
                </Link>
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                    {client && (
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={client.avatar} data-ai-hint={client.dataAiHint} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div>
                        <CardTitle className="text-2xl">{task.projectName}</CardTitle>
                        <CardDescription>
                            Task ID: {task.id} &middot; For {task.clientName}
                        </CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-border">
                    <DetailItem label="Work Status" value={<Badge variant="outline" className={statusColors[task.workStatus]}>{task.workStatus}</Badge>} />
                    <DetailItem label="Payment Status" value={<Badge variant="outline" className={statusColors[task.paymentStatus]}>{task.paymentStatus}</Badge>} />
                    {task.assignedTo && <DetailItem label="Assigned To" value={
                        <div className='flex items-center gap-2'>
                            <User className="h-4 w-4 text-muted-foreground" />
                            {task.assignedTo}
                        </div>
                    } />}
                    <Separator />
                    <DetailItem label="Accepted Date" value={new Date(task.acceptedDate).toLocaleDateString()} />
                    <DetailItem label="Submission Date" value={new Date(task.submissionDate).toLocaleDateString()} />
                    <Separator />
                    <DetailItem label="Number of Pages" value={task.pages} />
                    <DetailItem label="Rate per Page" value={`₹${task.rate.toLocaleString()}`} />
                    <DetailItem label="Total Amount" value={<span className="text-lg font-bold">₹{task.total.toLocaleString()}</span>} />
                     <DetailItem label="Amount Paid" value={<span className="font-bold text-green-600">₹{task.amountPaid.toLocaleString()}</span>} />
                    <DetailItem label="Remaining Amount" value={<span className="font-bold text-red-600">₹{(task.total - task.amountPaid).toLocaleString()}</span>} />
                </dl>
                {task.notes && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Notes</h3>
                        <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">{task.notes}</p>
                    </div>
                )}
                 {(task.projectFileLink || task.outputFileLink) && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Project Files</h3>
                        <div className="flex gap-2">
                            {task.projectFileLink && (
                                <Button variant="outline" asChild>
                                    <a href={task.projectFileLink} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> View Project File
                                    </a>
                                </Button>
                            )}
                            {task.outputFileLink && (
                                <Button variant="outline" asChild>
                                    <a href={task.outputFileLink} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> View Output File
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <AdminActions task={task}/>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
