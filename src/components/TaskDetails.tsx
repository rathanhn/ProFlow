
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { Task } from '@/lib/types';

const statusColors: Record<string, string> = {
  Paid: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  Partial: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  Unpaid: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  Completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  Pending: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
);


export default function TaskDetails({ task }: { task: Task }) {
  return (
    <>
      <dl className="divide-y divide-border">
        <DetailItem label="Client Name" value={task.clientName} />
        <DetailItem label="Work Status" value={<Badge variant="outline" className={statusColors[task.workStatus]}>{task.workStatus}</Badge>} />
        <DetailItem label="Payment Status" value={<Badge variant="outline" className={statusColors[task.paymentStatus]}>{task.paymentStatus}</Badge>} />
        {task.assigneeName && <DetailItem label="Assigned To" value={
            <div className='flex items-center gap-2'>
                <User className="h-4 w-4 text-muted-foreground" />
                {task.assigneeName}
            </div>
        } />}
        <Separator />
        <DetailItem label="Accepted Date" value={new Date(task.acceptedDate).toLocaleDateString()} />
        <DetailItem label="Submission Date" value={new Date(task.submissionDate).toLocaleDateString()} />
        <Separator />
        <DetailItem label="Number of Pages" value={task.pages} />
        <DetailItem label="Rate per Page" value={`₹${task.rate.toLocaleString()}`} />
        <DetailItem label="Total Amount" value={<span className="font-bold">₹{task.total.toLocaleString()}</span>} />
        <DetailItem label="Amount Paid" value={<span className="font-bold text-green-600">₹{task.amountPaid.toLocaleString()}</span>} />
        <DetailItem label="Remaining Amount" value={<span className="font-bold text-red-600">₹{(task.total - task.amountPaid).toLocaleString()}</span>} />
      </dl>
      {task.notes && (
          <div className="mt-6">
              <h3 className="font-semibold mb-2 text-sm">Notes</h3>
              <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">{task.notes}</p>
          </div>
      )}
       {(task.projectFileLink || task.outputFileLink) && (
          <div className="mt-6">
              <h3 className="font-semibold mb-2 text-sm">Project Files</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                  {task.projectFileLink && (
                      <Button variant="outline" asChild className="w-full">
                          <a href={task.projectFileLink} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" /> View Project File
                          </a>
                      </Button>
                  )}
                  {task.outputFileLink && (
                      <Button variant="outline" asChild className="w-full">
                          <a href={task.outputFileLink} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" /> View Output File
                          </a>
                      </Button>
                  )}
              </div>
          </div>
      )}
    </>
  );
}
