
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
import React from 'react';
import ImageUploader from './ImageUploader';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().optional(),
  defaultRate: z.number().min(0, 'Default rate must be positive').optional(),
  avatar: z.string().url('Avatar must be a valid URL.').or(z.literal('')),
});

interface ClientFormProps {
  client?: Client;
  redirectPath?: string;
}

export default function ClientForm({ client, redirectPath }: ClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      defaultRate: client?.defaultRate || undefined,
      avatar: client?.avatar || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const finalValues = {
        ...values,
        avatar: values.avatar || `https://placehold.co/128x128.png?text=${values.name.charAt(0)}`
      };

      if (client) {
        await updateClient(client.id, finalValues);
        toast({
          title: 'Client Updated!',
          description: `Client "${values.name}" has been saved.`,
        });
      } else {
        await addClient(finalValues as Omit<Client, 'id'>);
        toast({
          title: 'Client Created!',
          description: `An invitation email has been sent to "${values.name}".`,
        });
      }
      const targetPath = redirectPath || '/admin/clients';
      router.push(targetPath);
      router.refresh();
    } catch (error: unknown) {
      console.error("Failed to save client:", error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save client. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <Card className="hover-lift">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl">
            {client ? 'Edit Client' : 'Create a New Client'}
          </CardTitle>
          <CardDescription className="text-base">
            {client ? 'Update the details for this client.' : 'The new client will receive an email to set up their account password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value}
                        onChange={field.onChange}
                        fallbackText={form.getValues('name')?.charAt(0) || 'C'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Rate per Page (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      This rate will be used as default when creating new tasks for this client
                    </p>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {client ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    client ? 'Update Client' : 'Create Client'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
