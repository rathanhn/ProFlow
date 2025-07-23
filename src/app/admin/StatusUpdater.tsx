
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { updateTask } from '@/lib/firebase-service';
import { Task, WorkStatus } from '@/lib/types';
import PaymentDialog from '@/components/PaymentDialog';

const workStatuses: WorkStatus[] = ['Pending', 'In Progress', 'Completed'];

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
  const [isPaymentDialogOpen, setPaymentDialogOpen] = React.useState(false);

  const handleWorkStatusChange = async (newStatus: WorkStatus) => {
    try {
      await updateTask(task.id, { workStatus: newStatus });
      toast({
        title: 'Status Updated!',
        description: `${task.projectName}'s work status is now ${newStatus}.`,
      });
      router.refresh();
    } catch (error) {
      console.error(`Failed to update work status:`, error);
      toast({
        title: 'Update Failed',
        description: 'Could not update the work status.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentClick = () => {
    if (task.paymentStatus !== 'Paid') {
      setPaymentDialogOpen(true);
    } else {
      toast({ title: "Project Already Paid", description: "This project has been fully paid." });
    }
  };


  if (field === 'workStatus') {
    return (
      <Select value={task.workStatus} onValueChange={handleWorkStatusChange}>
        <SelectTrigger className="w-full border-none p-0 h-auto focus:ring-0 focus:ring-offset-0">
          <Badge variant="outline" className={`${statusColors[task.workStatus]} cursor-pointer`}>
            {task.workStatus}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          {workStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Render payment status badge and dialog
  return (
    <>
      <Badge
        variant="outline"
        className={`${statusColors[task.paymentStatus]} ${task.paymentStatus !== 'Paid' ? 'cursor-pointer' : ''}`}
        onClick={handlePaymentClick}
      >
        {task.paymentStatus}
      </Badge>

      <PaymentDialog 
        task={task} 
        isOpen={isPaymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)} 
      />
    </>
  );
}
