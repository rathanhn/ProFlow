
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
import { useToast } from '@/hooks/use-toast';
import { addTask, updateTask, getClients, getTasks, getAssignees, addAssignee } from '@/lib/firebase-service';
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';


const workStatuses = ['Pending', 'In Progress', 'Completed'] as const;
const paymentStatuses = ['Unpaid', 'Partial', 'Paid'] as const;

const formSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  projectName: z.string().min(1, 'Project name is required'),
  pages: z.coerce.number().min(1, 'Pages must be at least 1'),
  rate: z.coerce.number().min(1, 'Rate must be at least 1'),
  workStatus: z.enum(workStatuses),
  // paymentStatus is handled by transactions now, so we remove it from the form
  // paymentStatus: z.enum(paymentStatuses), 
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

const newAssigneeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email.").optional(),
});

interface TaskFormProps {
  task?: Task;
}

export default function TaskForm({ task }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [assignees, setAssignees] = React.useState<Assignee[]>([]);
  const [isAddAssigneeDialogOpen, setAddAssigneeDialogOpen] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeEmail, setNewAssigneeEmail] = useState("");

  const fetchClients = React.useCallback(async () => {
      const clientData = await getClients();
      setClients(clientData);
  }, []);

  const fetchAssignees = React.useCallback(async () => {
      const assigneeData = await getAssignees();
      setAssignees(assigneeData);
  }, []);


  React.useEffect(() => {
      fetchClients();
      fetchAssignees();
  }, [fetchClients, fetchAssignees]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: task?.clientName || '',
      projectName: task?.projectName || '',
      pages: task?.pages || 1,
      rate: task?.rate || 100,
      workStatus: task?.workStatus || 'Pending',
      assignedTo: task?.assignedTo || '',
      notes: task?.notes || '',
    },
  });

  const handleAddAssignee = async () => {
    try {
        const validation = newAssigneeSchema.safeParse({ name: newAssigneeName, email: newAssigneeEmail });
        if (!validation.success) {
            toast({ title: "Invalid Input", description: validation.error.errors[0].message, variant: 'destructive' });
            return;
        }

        const newAssignee = await addAssignee({ name: newAssigneeName, email: newAssigneeEmail });
        await fetchAssignees(); // Re-fetch the list
        form.setValue('assignedTo', newAssignee.name); // Set the newly added assignee as selected
        toast({ title: "Team Member Added", description: `${newAssignee.name} has been added to the team.` });
        setNewAssigneeName("");
        setNewAssigneeEmail("");
        setAddAssigneeDialogOpen(false); // Close the dialog
    } catch (error) {
        console.error("Failed to add assignee:", error);
        toast({ title: 'Error', description: 'Failed to add team member.', variant: 'destructive' });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const client = clients.find(c => c.name === values.clientName);
        if (!client) {
            toast({
                title: 'Error',
                description: 'Selected client not found.',
                variant: 'destructive'
            });
            return;
        }

        if (task) {
             const taskData = {
                ...values,
                clientId: client.id,
                total: values.pages * values.rate,
                workStatus: values.workStatus as WorkStatus,
            };
            await updateTask(task.id, taskData);
            toast({
                title: 'Task Updated!',
                description: `Project "${values.projectName}" has been saved.`,
            });
        } else {
            const newTaskData = {
                ...values,
                clientId: client.id,
                total: values.pages * values.rate,
                workStatus: values.workStatus as WorkStatus,
                paymentStatus: 'Unpaid' as PaymentStatus,
                amountPaid: 0,
                acceptedDate: new Date().toISOString(),
                submissionDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
                slNo: (await getTasks()).length + 1
            }
            await addTask(newTaskData as Omit<Task, 'id'>);
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
        });
    }
  }

  return (
    <>
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
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">N/A</SelectItem>
                            {assignees.map((assignee: Assignee) => (
                              <SelectItem key={assignee.id} value={assignee.name}>
                                {assignee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Dialog open={isAddAssigneeDialogOpen} onOpenChange={setAddAssigneeDialogOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="icon">
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Team Member</DialogTitle>
                                    <DialogDescription>
                                        Enter the details for the new team member. They will then be available for assignment.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-assignee-name">Name</Label>
                                        <Input id="new-assignee-name" value={newAssigneeName} onChange={(e) => setNewAssigneeName(e.target.value)} placeholder="e.g. Alex" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-assignee-email">Email (Optional)</Label>
                                        <Input id="new-assignee-email" type="email" value={newAssigneeEmail} onChange={(e) => setNewAssigneeEmail(e.target.value)} placeholder="alex@example.com" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={handleAddAssignee}>Add Member</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          </SelectTrigger>
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
    </>
  );
}
