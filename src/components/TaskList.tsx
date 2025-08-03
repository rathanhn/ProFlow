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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.totalTasks}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unpaid</p>
                  <p className="text-2xl font-bold text-red-600">₹{stats.unpaidAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title} ({filteredTasks.length})</span>
            <div className="flex items-center gap-2">
              {showAddButton && (
                <Link href={addButtonLink}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-normal text-muted-foreground">Filter & Search</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search tasks by project name${showClient ? ', client' : ''} or notes...`}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Work Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
        </CardContent>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{emptyStateMessage}</h3>
            <p className="text-muted-foreground mb-4">{emptyStateDescription}</p>
            {tasks.length === 0 && showAddButton && (
              <Link href={addButtonLink}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Task
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              showClient={showClient}
              onDelete={onTaskDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
