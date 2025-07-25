
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
import { getTask, getClient, getAssignee } from '@/lib/firebase-service';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, User, Download, Mail, Phone, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React, { useEffect, useState } from 'react';
import { Task, Client, Assignee } from '@/lib/types';
import ClientActions from './ClientActions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        <dd className="font-medium text-right text-balance">{value}</dd>
    </div>
);

export default function ProjectDetailsPage() {
  const params = useParams();
  const { id, taskId } = params as { id: string; taskId: string };
  const [task, setTask] = useState<Task | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [assignee, setAssignee] = useState<Assignee | null>(null);

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

        if (taskData.assigneeId) {
            const assigneeData = await getAssignee(taskData.assigneeId);
            if (assigneeData) {
                setAssignee(JSON.parse(JSON.stringify(assigneeData)));
            }
        }
      };
      fetchDetails();
    }
  }, [id, taskId]);

  if (!task || !client) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  const amountPaid = task.amountPaid ?? 0;
  const total = task.total ?? 0;
  const remainingAmount = total - amountPaid;

  return (
    <DashboardLayout>
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
                <Link href={`/client/${client.id}/projects`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Your Projects
                </Link>
            </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
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
                    <DetailItem label="Total Cost" value={<span className="text-lg font-bold">₹{total.toLocaleString()}</span>} />
                    <DetailItem label="Amount Paid" value={<span className="font-bold text-green-600">₹{amountPaid.toLocaleString()}</span>} />
                    <DetailItem label="Remaining Amount" value={<span className="font-bold text-red-600">₹{remainingAmount.toLocaleString()}</span>} />
                </dl>
                
                 {(task.projectFileLink || task.outputFileLink) && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Downloads</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {task.projectFileLink && (
                                <Button asChild>
                                    <a href={task.projectFileLink} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> Download Project File
                                    </a>
                                </Button>
                            )}
                            {task.outputFileLink && (
                                <Button asChild>
                                    <a href={task.outputFileLink} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> Download Output File
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
            {assignee && (
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned To</CardTitle>
                        <CardDescription>Your point of contact for this project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Link href={`/profile/${assignee.id}`} className="block hover:bg-muted p-2 rounded-md -m-2">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{assignee.name}</p>
                                <p className="text-sm text-muted-foreground">Creator</p>
                            </div>
                        </div>
                       </Link>
                         <dl className="mt-4 space-y-2">
                            {assignee.email && (
                                <div className='flex items-center gap-2 text-sm'>
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a href={`mailto:${assignee.email}`} className="hover:underline">{assignee.email}</a>
                                </div>
                            )}
                             {assignee.mobile && (
                                <div className='flex items-center gap-2 text-sm'>
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${assignee.mobile}`} className="hover:underline">{assignee.mobile}</a>
                                </div>
                            )}
                        </dl>
                         <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                            <Link href={`/profile/${assignee.id}`}>
                               <Eye className="mr-2 h-4 w-4" />
                               View Full Profile
                            </Link>
                         </Button>
                    </CardContent>
                </Card>
            )}
            <ClientActions task={task} client={client} assignee={assignee} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
