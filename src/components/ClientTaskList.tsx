'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Search,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';
import { INRIcon } from '@/components/ui/inr-icon';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';
import { useAuth } from './AuthProvider';
import { MetricCard } from './ui/charts';

interface ClientTaskListProps {
  tasks: Task[];
  clientId: string;
  title?: string;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  className?: string;
}

export default function ClientTaskList({
  tasks,
  clientId,
  title = "Your Projects",
  emptyStateMessage = "No projects found",
  emptyStateDescription = "You don't have any projects yet.",
  className
}: ClientTaskListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const { user } = useAuth();

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.workStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || task.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate statistics
  const stats = {
    totalProjects: tasks.length,
    completedProjects: tasks.filter(t => t.workStatus === 'Completed').length,
    inProgressProjects: tasks.filter(t => t.workStatus === 'In Progress').length,
    pendingProjects: tasks.filter(t => t.workStatus === 'Pending').length,
    totalValue: tasks.reduce((sum, t) => sum + t.total, 0),
    paidAmount: tasks.reduce((sum, t) => sum + t.amountPaid, 0),
    unpaidAmount: tasks.reduce((sum, t) => sum + (t.total - t.amountPaid), 0),
    overdueProjects: tasks.filter(t => {
      const today = new Date();
      const submission = new Date(t.submissionDate);
      return submission < today && t.workStatus !== 'Completed';
    }).length,
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Statistics */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <MetricCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<FileText className="h-6 w-6 text-primary" />}
            className="glass-card border-primary/20"
          />

          <MetricCard
            title="In Progress"
            value={stats.inProgressProjects}
            icon={<Clock className="h-6 w-6 text-blue-500" />}
            className="glass-card border-blue-500/20"
          />

          {user && (
            <>
              <MetricCard
                title="Investment"
                value={`₹${stats.totalValue.toLocaleString()}`}
                icon={<INRIcon className="h-6 w-6 text-blue-500" />}
                className="glass-card border-blue-500/20"
              />

              <MetricCard
                title={stats.overdueProjects > 0 ? 'Overdue projects' : 'Pending Payment'}
                value={stats.overdueProjects > 0 ? stats.overdueProjects : `₹${stats.unpaidAmount.toLocaleString()}`}
                icon={stats.overdueProjects > 0 ? <Clock className="h-6 w-6 text-rose-500" /> : <INRIcon className="h-6 w-6 text-amber-500" />}
                className={cn(
                  "glass-card",
                  stats.overdueProjects > 0 ? "border-rose-500/20" : "border-amber-500/20"
                )}
              />
            </>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {title} ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects by name or notes..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Work Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {user && (
                <div className="flex-1">
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
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
              {tasks.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPaymentFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard
                task={task}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
