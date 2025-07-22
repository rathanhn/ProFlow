
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Client } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addClient, updateClient } from '@/lib/firebase-service';

const formSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Please enter a valid email.'),
  dataAiHint: z.string().min(2, 'AI hint must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  avatar: z.string().url().optional(),
});

const editFormSchema = formSchema.omit({ password: true });

interface ClientFormProps {
  client?: Client;
}

export default function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(client ? editFormSchema : formSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      dataAiHint: client?.dataAiHint || '',
      password: '',
      avatar: client?.avatar || `https://placehold.co/32x32.png`,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        if (client) {
            await updateClient(client.id, values);
            toast({
                title: 'Client Updated!',
                description: `Client "${values.name}" has been saved.`,
            });
        } else {
            await addClient(values);
            toast({
                title: 'Client Created!',
                description: `Client "${values.name}" has been added.`,
            });
        }
        router.push('/admin/clients');
        router.refresh();
    } catch (error) {
        console.error("Failed to save client:", error);
        toast({
            title: 'Error',
            description: 'Failed to save client. Please try again.',
            variant: 'destructive'
        })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{client ? 'Edit Client' : 'Create a New Client'}</CardTitle>
        <CardDescription>
          {client ? 'Update the details for this client.' : 'Enter the details for the new client.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Innovate Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="client@example.com" {...field} disabled={!!client} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="dataAiHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar AI Hint</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 'abstract logo' or 'tech company'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            {!client && (
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Enter a password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">{client ? 'Update Client' : 'Create Client'}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
