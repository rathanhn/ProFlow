import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTask, getAssignee, getClient } from '@/lib/firebase-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Sparkles, Layout, ShieldCheck } from 'lucide-react';
import TaskDetails from '@/components/TaskDetails';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CreatorActions from './CreatorActions';
import { Task, Client, Assignee } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function CreatorTaskDetailPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;

  const rawTask = await getTask(taskId);
  const rawCreator = await getAssignee(id);

  if (!rawTask || !rawCreator || rawTask.assigneeId !== rawCreator.id) {
    notFound();
  }

  const task = JSON.parse(JSON.stringify(rawTask)) as Task;
  const creator = JSON.parse(JSON.stringify(rawCreator)) as Assignee;

  const rawClient = await getClient(task.clientId);
  const client = rawClient ? JSON.parse(JSON.stringify(rawClient)) as Client : null;

  return (
    <DashboardLayout>
      <div className="space-y-8 fab-safe-bottom">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-2xl bg-secondary/50 hover:bg-secondary">
              <Link href={`/creator/${creator.id}/tasks`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0 h-4 border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
                  Task Workspace
                </Badge>
                <div className="h-1 w-1 rounded-full bg-border"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {task.projectNo || 'Project Details'}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter">{task.projectName}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xl shadow-lg shadow-emerald-500/10">
              {task.workStatus}
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2rem]">
              <CardHeader className="bg-gradient-to-br from-secondary/30 to-transparent border-b border-border/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    <Layout className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Project Documentation</CardTitle>
                    <CardDescription>Comprehensive details and requirements for this assignment.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <TaskDetails task={task} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <CreatorActions task={task} />

            {client && (
              <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2rem]">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Client Partner</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/20">
                    <Avatar className="h-14 w-14 ring-4 ring-white shadow-xl">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback className="bg-emerald-500 text-white font-bold">{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black text-sm truncate uppercase tracking-tight">{client.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                        <Mail className="h-3 w-3" />
                        <p className="text-[10px] font-medium truncate">{client.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="glass-card border-emerald-500/10 shadow-sm rounded-[2rem] bg-emerald-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-sm font-bold">Pro Tip</p>
                </div>
                <p className="text-xs text-emerald-600/80 mt-2 leading-relaxed">
                  Update your progress regularly to keep the client informed and ensure smooth project flow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
