
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { updateTask } from '@/lib/firebase-service';
import { Task, WorkStatus, PaymentStatus } from '@/lib/types';

const workStatuses: WorkStatus[] = ['Pending', 'In Progress', 'Completed'];
const paymentStatuses: PaymentStatus[] = ['Unpaid', 'Partial', 'Paid'];

const statusColors: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  Partial: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Unpaid: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  Completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
};

interface StatusUpdaterProps {
  task: Task;
  field: 'workStatus' | 'paymentStatus';
}

export default function StatusUpdater({ task, field }: StatusUpdaterProps) {
  const router = useRouter();
  const { toast } = useToast();
  const currentStatus = task[field];
  const options = field === 'workStatus' ? workStatuses : paymentStatuses;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask(task.id, { [field]: newStatus });
      toast({
        title: 'Status Updated!',
        description: `${task.projectName}'s ${field === 'workStatus' ? 'work status' : 'payment status'} is now ${newStatus}.`,
      });
      router.refresh();
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      toast({
        title: 'Update Failed',
        description: `Could not update the ${field}.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-full border-none p-0 h-auto focus:ring-0 focus:ring-offset-0">
         <Badge variant="outline" className={`${statusColors[currentStatus]} cursor-pointer`}>
            {currentStatus}
         </Badge>
      </SelectTrigger>
      <SelectContent>
        {options.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
