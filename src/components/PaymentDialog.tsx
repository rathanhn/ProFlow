
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
import { useToast } from '@/hooks/use-toast';
import { addTransactionAndUpdateTask } from '@/lib/firebase-service';
import { Task, PaymentMethod } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

const paymentMethods: PaymentMethod[] = ['Cash', 'Bank Transfer', 'UPI', 'Other'];

interface PaymentDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentDialog({ task, isOpen, onClose }: PaymentDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('UPI');
  const [notes, setNotes] = React.useState('');
  
  const totalAmount = task.total || 0;
  const amountPaid = task.amountPaid || 0;
  const remainingAmount = totalAmount - amountPaid;

  // Pre-fill amount when dialog opens
  React.useEffect(() => {
    if (isOpen) {
        setAmount(remainingAmount.toString());
    }
  }, [isOpen, remainingAmount]);

  const handleAddPayment = async () => {
    const paidAmountValue = parseFloat(amount);
    if (isNaN(paidAmountValue) || paidAmountValue <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount.', variant: 'destructive' });
      return;
    }

    try {
      await addTransactionAndUpdateTask(task.id, paidAmountValue, paymentMethod, notes);
      toast({
        title: 'Payment Recorded!',
        description: `A payment of ₹${paidAmountValue} has been recorded for ${task.projectName}.`,
      });
      // Reset form and close
      setAmount('');
      setPaymentMethod('UPI');
      setNotes('');
      onClose(); 
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a Payment for {task.projectName}</DialogTitle>
          <DialogDescription>
              The total amount for this project is ₹{totalAmount.toLocaleString()}. 
              So far, ₹{amountPaid.toLocaleString()} has been paid. 
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
  );
}
