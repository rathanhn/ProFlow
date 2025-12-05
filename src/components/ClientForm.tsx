
'use client';

import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
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

const rateSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  rate: z.number().positive('Rate must be greater than 0'),
});

const formSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().optional(),
  defaultRate: z.number().min(0, 'Default rate must be positive').optional(),
  defaultRates: z.array(rateSchema).optional(),
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
      defaultRates: client?.defaultRates && client.defaultRates.length > 0
        ? client.defaultRates
        : client?.defaultRate
          ? [{ label: 'Default', rate: client.defaultRate }]
          : [],
      avatar: client?.avatar || '',
    },
  });

  const {
    fields: rateFields,
    append: appendRate,
    remove: removeRate,
  } = useFieldArray({
    control: form.control,
    name: 'defaultRates',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const finalValues = {
        ...values,
        // keep legacy defaultRate for backward compatibility (use first rate if not provided)
        defaultRate: values.defaultRate ?? values.defaultRates?.[0]?.rate,
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
                      Legacy default rate. If multiple rates are set below, the first rate is used as fallback.
                    </p>
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Default Rates (multiple)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendRate({ label: '', rate: 0 })}
                  >
                    Add Rate
                  </Button>
                </div>
                {rateFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">No default rates yet. Add entries like “A4 sheet - 100”.</p>
                )}
                <div className="space-y-2">
                  {rateFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-6">
                        <Input
                          placeholder="Label (e.g., A4 sheet)"
                          value={form.watch(`defaultRates.${index}.label`) ?? ''}
                          onChange={(e) => form.setValue(`defaultRates.${index}.label`, e.target.value)}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          placeholder="Rate"
                          value={form.watch(`defaultRates.${index}.rate`) ?? ''}
                          onChange={(e) =>
                            form.setValue(
                              `defaultRates.${index}.rate`,
                              e.target.value ? parseFloat(e.target.value) : (undefined as any)
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeRate(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </div>
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
