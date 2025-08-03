'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock, 
  User,
  Eye,
  Download
} from 'lucide-react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ClientTaskCardProps {
  task: Task;
  clientId: string;
  className?: string;
}

export default function ClientTaskCard({ task, clientId, className }: ClientTaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (submissionDate: string) => {
    const today = new Date();
    const submission = new Date(submissionDate);
    const diffTime = submission.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining(task.submissionDate);
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <Card className={cn("hover-lift group animate-fade-in", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors-smooth">
              {task.projectName}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={cn(getStatusColor(task.workStatus), "transition-all-smooth")}>
                {task.workStatus}
              </Badge>
              <Badge className={cn(getPaymentColor(task.paymentStatus), "transition-all-smooth")}>
                {task.paymentStatus}
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800 animate-pulse">
                  <Clock className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {isDueSoon && !isOverdue && (
                <Badge className="bg-orange-100 text-orange-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Due Soon
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Link href={`/client/${clientId}/projects/${task.id}`}>
              <Button variant="outline" size="icon-sm" className="hover:bg-primary hover:text-primary-foreground">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            {task.outputFileUrl && (
              <a href={task.outputFileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon-sm" className="hover:bg-accent hover:text-accent-foreground">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Project Details Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Pages</p>
              <p className="font-medium truncate">{task.pages}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Rate</p>
              <p className="font-medium truncate">₹{task.rate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Total</p>
              <p className="font-medium truncate">₹{task.total.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Paid</p>
              <p className="font-medium truncate">₹{task.amountPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Accepted</p>
              <p className="font-medium">{new Date(task.acceptedDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Due Date</p>
              <p className="font-medium">{new Date(task.submissionDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-medium">
              ₹{task.amountPaid.toLocaleString()} / ₹{task.total.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((task.amountPaid / task.total) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round((task.amountPaid / task.total) * 100)}% completed
          </p>
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Assignee</p>
              <p className="font-medium">{task.assignee}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div className="text-sm">
            <p className="text-muted-foreground text-xs mb-1">Notes</p>
            <p className="text-muted-foreground leading-relaxed">{task.notes}</p>
          </div>
        )}

        {/* File Links */}
        <div className="flex flex-wrap gap-2">
          {task.projectFileUrl && (
            <a href={task.projectFileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Project File
              </Button>
            </a>
          )}
          {task.outputFileUrl && (
            <a href={task.outputFileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Download Output
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
