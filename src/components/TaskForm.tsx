
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, Client, WorkStatus, PaymentStatus, Assignee } from '@/lib/types';
import { assignees } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { addTask, updateTask, getClients } from '@/lib/firebase-service';
import React from 'react';

const workStatuses: WorkStatus[] = ['Pending', 'In Progress', 'Completed'];
const paymentStatuses: PaymentStatus[] = ['Unpaid', 'Partial', 'Paid'];

const formSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  projectName: z.string().min(1, 'Project name is required'),
  pages: z.coerce.number().min(1, 'Pages must be at least 1'),
  rate: z.coerce.number().min(1, 'Rate must be at least 1'),
  workStatus: z.enum(workStatuses),
  paymentStatus: z.enum(paymentStatuses),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

interface TaskFormProps {
  task?: Task;
}

export default function TaskForm({ task }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = React.useState<Client[]>([]);

  React.useEffect(() => {
      const fetchClients = async () => {
          const clientData = await getClients();
          setClients(clientData);
      }
      fetchClients();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: task?.clientName || '',
      projectName: task?.projectName || '',
      pages: task?.pages || 1,
      rate: task?.rate || 100,
      workStatus: task?.workStatus || 'Pending',
      paymentStatus: task?.paymentStatus || 'Unpaid',
      assignedTo: task?.assignedTo || '',
      notes: task?.notes || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        if (task) {
            await updateTask(task.id, values);
            toast({
                title: 'Task Updated!',
                description: `Project "${values.projectName}" has been saved.`,
            });
        } else {
            await addTask(values as any); // Type assertion needed for server-side fields
            toast({
                title: 'Task Created!',
                description: `Project "${values.projectName}" has been added.`,
            });
        }
        router.push('/admin');
        router.refresh();
    } catch (error) {
        console.error("Failed to save task:", error);
        toast({
            title: 'Error',
            description: 'Failed to save task. Please try again.',
            variant: 'destructive'
        })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task ? 'Edit Task' : 'Create a New Task'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client: Client) => (
                          <SelectItem key={client.id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. E-commerce Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team member" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {assignees.map((assignee: Assignee) => (
                          <SelectItem key={assignee.id} value={assignee.name}>
                            {assignee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Pages</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per Page (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="workStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work status" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {workStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {paymentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any relevant notes here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">{task ? 'Update Task' : 'Create Task'}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
