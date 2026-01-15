'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  FileText,
  Plus,
  TrendingUp,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { INRIcon } from '@/components/ui/inr-icon';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';
import Link from 'next/link';
import { MetricCard } from './ui/charts';

interface TaskListProps {
  tasks: Task[];
  title?: string;
  showClient?: boolean;
  showAddButton?: boolean;
  addButtonLink?: string;
  onTaskDelete?: (taskId: string) => void;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  showStats?: boolean;
}

export default function TaskList({
  tasks,
  title = "Tasks",
  showClient = false,
  showAddButton = true,
  addButtonLink = "/admin/tasks/new",
  onTaskDelete,
  emptyStateMessage = "No tasks found",
  emptyStateDescription = "There are no tasks to display.",
  showStats = true
}: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search on Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.projectNo && task.projectNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (showClient && task.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.workStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || task.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate statistics
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.workStatus === 'Completed').length,
    pendingTasks: tasks.filter(t => t.workStatus === 'Pending').length,
    inProgressTasks: tasks.filter(t => t.workStatus === 'In Progress').length,
    totalValue: tasks.reduce((sum, t) => sum + t.total, 0),
    paidAmount: tasks.reduce((sum, t) => sum + t.amountPaid, 0),
    unpaidAmount: tasks.reduce((sum, t) => sum + (t.total - t.amountPaid), 0),
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overlay */}
      {showStats && tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in mb-8">
          <MetricCard
            title="Total Ventures"
            value={stats.totalTasks}
            icon={<FileText className="h-6 w-6 text-primary" />}
            className={cn(
              "glass-card border-primary/20",
              statusFilter === 'all' && paymentFilter === 'all' && "ring-2 ring-primary/50"
            )}
          />

          <MetricCard
            title="Success Milestone"
            value={stats.completedTasks}
            icon={<TrendingUp className="h-6 w-6 text-emerald-500" />}
            className={cn(
              "glass-card border-emerald-500/20",
              statusFilter === 'Completed' && "ring-2 ring-emerald-500/50"
            )}
          />

          <MetricCard
            title="Network Valuation"
            value={`₹${stats.totalValue.toLocaleString()}`}
            icon={<INRIcon className="h-6 w-6 text-indigo-500" />}
            className="glass-card border-indigo-500/20"
          />

          <MetricCard
            title="Settlement Due"
            value={`₹${stats.unpaidAmount.toLocaleString()}`}
            icon={<INRIcon className="h-6 w-6 text-rose-500" />}
            className={cn(
              "glass-card border-rose-500/20",
              paymentFilter === 'Unpaid' && "ring-2 ring-rose-500/50"
            )}
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="glass-card rounded-2xl p-4 transition-all duration-300 border-white/20 dark:border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 px-0.5 bg-primary rounded-full hidden md:block" />
            <div>
              <h2 className="premium-heading text-lg">{title}</h2>
              <p className="premium-label opacity-60 mt-1">{filteredTasks.length} nodes active</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-3xl">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                ref={searchInputRef}
                placeholder="Search projects..."
                className="pl-9 pr-12 h-10 border-none bg-secondary/50 focus:bg-background transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border border-muted-foreground/30 bg-muted/50 text-[10px] font-black text-muted-foreground/70 pointer-events-none">
                <span className="text-[8px]">CTRL</span> K
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full sm:w-[140px] border-none bg-secondary/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="h-10 w-full sm:w-[140px] border-none bg-secondary/50">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex bg-secondary/50 p-1 rounded-xl items-center">
                <Button
                  variant={viewMode === 'simple' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("h-8 w-8 rounded-lg", viewMode === 'simple' && "shadow-sm bg-white dark:bg-black/40")}
                  onClick={() => setViewMode('simple')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'detailed' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("h-8 w-8 rounded-lg", viewMode === 'detailed' && "shadow-sm bg-white dark:bg-black/40")}
                  onClick={() => setViewMode('detailed')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              {showAddButton && (
                <Link href={addButtonLink} className="hidden sm:block">
                  <Button size="icon" className="h-10 w-10 shrink-0 glow-blue">
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="p-12 text-center">
            <div className="animate-scale-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl"></div>
                <div className="relative p-4 bg-muted/50 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{emptyStateMessage}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                {emptyStateDescription}
              </p>
              {tasks.length === 0 && showAddButton && (
                <Link href={addButtonLink}>
                  <Button size="lg" className="animate-pulse hover:animate-none">
                    <Plus className="mr-2 h-5 w-5" />
                    Create First Task
                  </Button>
                </Link>
              )}
              {tasks.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset filters
                    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                    if (searchInput) searchInput.value = '';
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={cn("grid gap-4", viewMode === 'simple' ? "grid-cols-1" : "grid-cols-1")}>
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {viewMode === 'detailed' ? (
                <TaskCard
                  task={task}
                  showClient={showClient}
                  onDelete={onTaskDelete}
                />
              ) : (
                <SimpleTaskRow task={task} showClient={showClient} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Minimal Simple View Component
function SimpleTaskRow({ task, showClient }: { task: Task; showClient?: boolean }) {
  return (
    <div className="glass-card p-3 rounded-xl border-white/10 hover:border-primary/30 transition-all group flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
          {task.projectNo}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{task.projectName}</h3>
          {showClient && <p className="text-[10px] text-muted-foreground font-medium">{task.clientName}</p>}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-1.5">
          {task.workStatus === 'Completed' ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-amber-500" />}
          <span className="text-[10px] uppercase font-black text-muted-foreground">{task.workStatus}</span>
        </div>

        <div className="text-right min-w-[100px]">
          <p className="premium-stat-label">Total Valuation</p>
          <p className="premium-value text-base">₹{task.total.toLocaleString()}</p>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
          <Link href={`/admin/tasks/${task.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
