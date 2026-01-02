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
  Printer,
  ShieldCheck,
  Sparkles,
  Zap,
  Briefcase
} from 'lucide-react';
import { Client, Task, Assignee } from '@/lib/types';
import TaskList from '@/components/TaskList';
import ExportDialog from '@/components/ExportDialog';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/charts';
import { INRIcon } from '@/components/ui/inr-icon';

interface ClientTasksViewProps {
  client: Client;
  tasks: Task[];
  assignees?: Assignee[];
}

export default function ClientTasksView({ client, tasks, assignees = [] }: ClientTasksViewProps) {
  const router = useRouter();

  const totalRevenue = tasks.filter(t => t.paymentStatus === 'Paid').reduce((acc, t) => acc + (t.total || 0), 0);
  const pendingRevenue = tasks.filter(t => t.paymentStatus !== 'Paid').reduce((acc, t) => acc + ((t.total || 0) - (t.amountPaid || 0)), 0);

  return (
    <div className="space-y-8 fab-safe-bottom pt-4">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-700 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-black/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-white/20 shadow-2xl">
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback className="text-3xl bg-indigo-500 font-black">{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-[10px] font-black uppercase tracking-widest leading-none">
                  Partner Node
                </span>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold px-2 py-0 h-4">
                  Active Account
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-1 leading-tight">
                {client.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/60">
                  <Mail className="h-3.5 w-3.5 text-cyan-300" /> {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/60">
                    <Phone className="h-3.5 w-3.5 text-indigo-300" /> {client.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <ExportDialog
            baseUrl={`/admin/clients/${client.id}/report`}
            assignees={assignees}
          />
          <Button variant="outline" className="h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-xl font-bold" onClick={() => router.push(`/admin/clients/${client.id}/edit?redirect=/admin/clients/${client.id}`)}>
            <Edit className="mr-2 h-5 w-5" /> Modify Node
          </Button>
          <Button className="h-12 bg-white text-indigo-700 hover:bg-indigo-50 font-black shadow-xl" onClick={() => router.push(`/admin/tasks/new?clientId=${client.id}&redirect=/admin/clients/${client.id}`)}>
            <Plus className="mr-2 h-5 w-5" /> Initiate Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={tasks.length}
          icon={<Briefcase className="h-6 w-6 text-indigo-500" />}
          className="glass-card border-indigo-500/20 shadow-indigo-500/5"
        />
        <MetricCard
          title="Settled Value"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<INRIcon className="h-6 w-6 text-emerald-500" />}
          className="glass-card border-emerald-500/20 shadow-emerald-500/5"
        />
        <MetricCard
          title="Outstanding"
          value={`₹${pendingRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-amber-500" />}
          className="glass-card border-amber-500/20 shadow-amber-500/5"
        />
        <MetricCard
          title="Standard Rate"
          value={client.defaultRate ? `₹${client.defaultRate}/PG` : 'N/A'}
          icon={<Sparkles className="h-6 w-6 text-violet-500" />}
          className="glass-card border-violet-500/20 shadow-violet-500/5"
        />
      </div>

      {/* Tasks List */}
      <div className="glass-card border-white/20 shadow-2xl overflow-hidden rounded-[2.5rem]">
        <TaskList
          tasks={tasks}
          title={`${client.name}'s Protocol Board`}
          showClient={false}
          showAddButton={true}
          addButtonLink={`/admin/tasks/new?clientId=${client.id}&redirect=/admin/clients/${client.id}`}
          emptyStateMessage="NO DATA DETECTED"
          emptyStateDescription={`${client.name} has no projects registered in the current sector.`}
        />
      </div>
    </div>
  </div >
  );
}
