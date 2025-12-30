import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getAssignee, getTasksByAssigneeId } from '@/lib/firebase-service';
import TaskList from '@/components/TaskList';
import { Assignee, Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ListChecks, Clock, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CreatorTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawCreator = await getAssignee(id);

  if (!rawCreator) {
    notFound();
  }
  const creator = JSON.parse(JSON.stringify(rawCreator)) as Assignee;

  const rawCreatorTasks = await getTasksByAssigneeId(id);
  const creatorTasks = JSON.parse(JSON.stringify(rawCreatorTasks)) as Task[];

  const inProgressCount = creatorTasks.filter(t => t.workStatus === 'In Progress').length;
  const completedCount = creatorTasks.filter(t => t.workStatus === 'Completed').length;
  const pendingCount = creatorTasks.filter(t => t.workStatus === 'Pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-8 fab-safe-bottom">
        {/* Premium Page Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-700 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold px-2 py-0 h-4">
                  Management
                </Badge>
                <div className="h-1 w-1 rounded-full bg-white/30"></div>
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                  Task Library
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight flex items-center gap-3">
                <ListChecks className="h-10 w-10 text-emerald-300" /> All Assignments
              </h1>
              <p className="text-emerald-50/70 max-w-lg text-sm font-medium italic border-l-2 border-emerald-400/30 pl-4">
                Monitor and manage your creative pipeline efficiently. Keep track of deadlines and delivery milestones.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-xl flex flex-col items-center min-w-[100px]">
                <Clock className="h-5 w-5 text-emerald-300 mb-1" />
                <span className="text-2xl font-black">{inProgressCount}</span>
                <span className="text-[9px] font-black uppercase opacity-60">Working</span>
              </div>
              <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-xl flex flex-col items-center min-w-[100px]">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 mb-1" />
                <span className="text-2xl font-black">{completedCount}</span>
                <span className="text-[9px] font-black uppercase opacity-60">Finished</span>
              </div>
              <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-xl flex flex-col items-center min-w-[100px]">
                <Sparkles className="h-5 w-5 text-emerald-300 mb-1" />
                <span className="text-2xl font-black">{pendingCount}</span>
                <span className="text-[9px] font-black uppercase opacity-60">Queued</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden bg-white/5 backdrop-blur-sm">
          <TaskList
            tasks={creatorTasks}
            title="Active Production Line"
            showClient={true}
            showAddButton={false}
            emptyStateMessage="Studio is Clear"
            emptyStateDescription="You don't have any tasks assigned yet. New creative briefs will appear here as soon as they're dispatched."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
