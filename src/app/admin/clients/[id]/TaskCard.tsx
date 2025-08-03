'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  DollarSign, 
  User, 
  Eye, 
  Edit,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  getStatusColor: (status: string) => string;
  getPaymentColor: (status: string) => string;
}

export default function TaskCard({ task, getStatusColor, getPaymentColor }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (submissionDate: string) => {
    const today = new Date();
    const deadline = new Date(submissionDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(task.submissionDate);
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.projectName}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(task.workStatus)}>
                {task.workStatus}
              </Badge>
              <Badge className={getPaymentColor(task.paymentStatus)}>
                {task.paymentStatus}
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-800">
                  Overdue
                </Badge>
              )}
              {isDueSoon && !isOverdue && (
                <Badge className="bg-orange-100 text-orange-800">
                  Due Soon
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/tasks/${task.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/admin/tasks/${task.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Pages</p>
              <p className="font-medium">{task.pages}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Rate</p>
              <p className="font-medium">₹{task.rate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-medium">₹{task.total.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Paid</p>
              <p className="font-medium">₹{task.amountPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Accepted Date</p>
              <p className="font-medium">{formatDate(task.acceptedDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Submission Date</p>
              <p className="font-medium">{formatDate(task.submissionDate)}</p>
              {daysRemaining >= 0 ? (
                <p className={`text-xs ${isDueSoon ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {daysRemaining === 0 ? 'Due today' : `${daysRemaining} days remaining`}
                </p>
              ) : (
                <p className="text-xs text-red-600">
                  {Math.abs(daysRemaining)} days overdue
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Assignee */}
        {task.assigneeName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Assigned to</p>
              <p className="font-medium">{task.assigneeName}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Notes</p>
            <p className="text-gray-700 bg-gray-50 p-2 rounded text-sm">
              {task.notes}
            </p>
          </div>
        )}

        {/* File Links */}
        <div className="flex flex-wrap gap-2">
          {task.projectFileLink && (
            <a 
              href={task.projectFileLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
              Project File
            </a>
          )}
          {task.outputFileLink && (
            <a 
              href={task.outputFileLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
            >
              <ExternalLink className="h-3 w-3" />
              Output File
            </a>
          )}
        </div>

        {/* Payment Progress */}
        {task.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-medium">
                ₹{task.amountPaid.toLocaleString()} / ₹{task.total.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((task.amountPaid / task.total) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {((task.amountPaid / task.total) * 100).toFixed(1)}% paid
              {task.amountPaid < task.total && (
                <span className="text-red-600 ml-2">
                  (₹{(task.total - task.amountPaid).toLocaleString()} remaining)
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
