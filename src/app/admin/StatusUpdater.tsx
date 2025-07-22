
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { addTransactionAndUpdateTask } from '@/lib/firebase-service';
import { Task, WorkStatus, PaymentStatus, PaymentMethod } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { updateTask } from '@/lib/firebase-service';

const workStatuses: WorkStatus[] = ['Pending', 'In Progress', 'Completed'];
const paymentMethods: PaymentMethod[] = ['Cash', 'Bank Transfer', 'UPI', 'Other'];

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
  const [amount, setAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('UPI');
  const [notes, setNotes] = React.useState('');
  
  const remainingAmount = task.total - task.amountPaid;

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
    // Open the dialog only if there's a remaining balance
    if (task.paymentStatus !== 'Paid') {
      setAmount(remainingAmount.toString()); // Pre-fill with remaining amount
      setPaymentDialogOpen(true);
    } else {
      toast({ title: "Project Already Paid", description: "This project has been fully paid." });
    }
  };

  const handleAddPayment = async () => {
    const paidAmount = parseFloat(amount);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount.', variant: 'destructive' });
      return;
    }

    try {
      await addTransactionAndUpdateTask(task.id, paidAmount, paymentMethod, notes);
      toast({
        title: 'Payment Recorded!',
        description: `A payment of ₹${paidAmount} has been recorded for ${task.projectName}.`,
      });
      setPaymentDialogOpen(false);
      setAmount('');
      setPaymentMethod('UPI');
      setNotes('');
      router.refresh();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast({
        title: 'Transaction Failed',
        description: 'Could not record the payment.',
        variant: 'destructive',
      });
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

      <Dialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record a Payment for {task.projectName}</DialogTitle>
            <DialogDescription>
                The total amount for this project is ₹{task.total.toLocaleString()}. 
                So far, ₹{task.amountPaid.toLocaleString()} has been paid. 
                Remaining: ₹{remainingAmount.toLocaleString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Paid</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Cleared 50% of the payment." 
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleAddPayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
