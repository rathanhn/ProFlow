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
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, User, Download, Mail, Phone, Eye, Layout, ShieldCheck, Sparkles, Receipt, Calendar, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Task, Client, Assignee } from '@/lib/types';
import ClientActions from './ClientActions';
import TaskDiscussionAndActivity from '@/components/TaskDiscussionAndActivity';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  Partial: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Unpaid: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  Completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
};

const DetailItem = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) => (
  <div className="flex justify-between items-center py-4">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground/60" />}
      <dt className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">{label}</dt>
    </div>
    <dd className="font-black text-right text-balance text-sm">{value}</dd>
  </div>
);

export default function ClientProjectDetailPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { user } = useAuth();
  const [data, setData] = useState<{
    task: Task;
    client: Client;
    assignee: Assignee | null;
    id: string;
    taskId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { id, taskId } = await params;
      const rawTask = await getTask(taskId);
      const rawClient = await getClient(id);

      if (!rawTask || !rawClient || rawTask.clientId !== rawClient.id) {
        notFound();
        return;
      }

      const task = JSON.parse(JSON.stringify(rawTask)) as Task;
      const client = JSON.parse(JSON.stringify(rawClient)) as Client;

      let assignee: Assignee | null = null;
      if (task.assigneeId) {
        const rawAssignee = await getAssignee(task.assigneeId);
        if (rawAssignee) {
          assignee = JSON.parse(JSON.stringify(rawAssignee));
        }
      }

      setData({ task, client, assignee, id, taskId });
      setIsLoading(false);
    };

    loadData();
  }, [params]);

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const { task, client, assignee } = data;
  const amountPaid = task.amountPaid ?? 0;
  const total = task.total ?? 0;
  const remainingAmount = total - amountPaid;

  return (
    <DashboardLayout>
      <div className="space-y-8 fab-safe-bottom w-full">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-2xl bg-secondary/50 hover:bg-secondary">
              <Link href={`/client/${client.id}/projects`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0 h-4 border-indigo-500/20 text-indigo-600 bg-indigo-500/5">
                  Secure Workspace
                </Badge>
                <div className="h-1 w-1 rounded-full bg-border"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {task.projectNo || 'Project Overview'}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter">{task.projectName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-500 hover:bg-indigo-600 border-none px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xl shadow-lg shadow-indigo-500/10">
              {task.workStatus}
            </Badge>
            {user && (
              <Badge className="bg-violet-500 hover:bg-violet-600 border-none px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xl shadow-lg shadow-violet-500/10">
                {task.paymentStatus}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
              <CardHeader className="bg-gradient-to-br from-indigo-500/5 to-transparent border-b border-border/10 pb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <Layout className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight">Project Dashboard</CardTitle>
                    <CardDescription className="text-sm font-medium">Real-time status and financial breakdown of your asset.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-10">
                <dl className="divide-y divide-border/40">
                  <DetailItem label="Accepted Date" icon={Calendar} value={new Date(task.acceptedDate).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                  <DetailItem label="Target Delivery" icon={Clock} value={new Date(task.submissionDate).toLocaleDateString(undefined, { dateStyle: 'long' })} />

                  {user && (
                    <div className="py-6 px-4 bg-secondary/20 rounded-3xl my-6 border border-border/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Receipt className="h-4 w-4 text-indigo-500" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Financial Summary</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-muted-foreground/60">Total Value</p>
                          <p className="text-2xl font-black tracking-tighter">₹{total.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-emerald-600/60">Invested</p>
                          <p className="text-2xl font-black tracking-tighter text-emerald-600">₹{amountPaid.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-red-600/60">Balance Due</p>
                          <p className="text-2xl font-black tracking-tighter text-red-600">₹{remainingAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </dl>

                {(task.projectFileLink || task.outputFileLink) && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Asset Downloads</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {task.projectFileLink && (
                        <Button asChild className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20">
                          <a href={task.projectFileLink} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-3 h-5 w-5" /> Download Creative Brief
                          </a>
                        </Button>
                      )}
                      {task.outputFileLink && (
                        <Button asChild variant="secondary" className="rounded-2xl h-14 px-8 border-indigo-500/20 bg-secondary/50">
                          <a href={task.outputFileLink} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-3 h-5 w-5 text-indigo-500" /> Download Final Output
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discussion & Activity Log */}
            <div className="mt-8">
              <TaskDiscussionAndActivity
                taskId={task.id}
                currentUser={{ id: client.id, name: client.name, type: 'client' }}
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {assignee && (
              <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                      <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight">Creative Lead</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10">
                    <Avatar className="h-16 w-16 ring-4 ring-white shadow-2xl">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback className="bg-indigo-600 text-white font-black">{assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-sm uppercase tracking-tight truncate">{assignee.name}</p>
                      <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest mt-1">Project Assignee</p>
                    </div>
                  </div>

                  <div className="space-y-3 px-2">
                    {assignee.email && (
                      <div className='flex items-center gap-3 text-sm font-medium'>
                        <div className="h-8 w-8 rounded-xl bg-secondary/50 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <a href={`mailto:${assignee.email}`} className="hover:text-indigo-600 transition-colors truncate">{assignee.email}</a>
                      </div>
                    )}
                    {assignee.mobile && (
                      <div className='flex items-center gap-3 text-sm font-medium'>
                        <div className="h-8 w-8 rounded-xl bg-secondary/50 flex items-center justify-center">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <a href={`tel:${assignee.mobile}`} className="hover:text-indigo-600 transition-colors">{assignee.mobile}</a>
                      </div>
                    )}
                  </div>

                  <Button asChild variant="outline" className="w-full rounded-2xl h-12 font-bold border-indigo-500/10 hover:bg-indigo-500/5">
                    <Link href={`/profile/${assignee.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View Creator Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            <ClientActions task={task} client={client} assignee={assignee} />

            <Card className="glass-card border-indigo-500/10 shadow-sm rounded-[2.5rem] bg-indigo-500/5 overflow-hidden">
              <CardContent className="pt-8">
                <div className="flex items-center gap-3 text-indigo-700">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-sm font-black uppercase tracking-widest">Premium Support</p>
                </div>
                <p className="text-xs text-indigo-600/80 mt-3 leading-relaxed font-medium">
                  Your satisfaction is our priority. If you require any modifications or have questions regarding the delivery, use the feedback portal to connect with our team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
