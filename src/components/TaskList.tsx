'use client';

import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';
import Link from 'next/link';

interface TaskListProps {
  tasks: Task[];
  title?: string;
  showClient?: boolean;
  showAddButton?: boolean;
  addButtonLink?: string;
  onTaskDelete?: (taskId: string) => void;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
}

export default function TaskList({ 
  tasks, 
  title = "Tasks",
  showClient = false,
  showAddButton = true,
  addButtonLink = "/admin/tasks/new",
  onTaskDelete,
  emptyStateMessage = "No tasks found",
  emptyStateDescription = "There are no tasks to display."
}: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      {/* Statistics */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold transition-all-smooth">{stats.totalTasks}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success transition-all-smooth">{stats.completedTasks}</p>
                </div>
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold transition-all-smooth">₹{stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-accent/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unpaid</p>
                  <p className="text-2xl font-bold text-destructive transition-all-smooth">₹{stats.unpaidAmount.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-lg">
              {title} ({filteredTasks.length})
            </CardTitle>
            {showAddButton && (
              <Link href={addButtonLink}>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search tasks by project name${showClient ? ', client' : ''} or notes...`}
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
            </div>
          </div>
        </CardContent>
      </Card>

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
        <div className="grid gap-4">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard
                task={task}
                showClient={showClient}
                onDelete={onTaskDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
