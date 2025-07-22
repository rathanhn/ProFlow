
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/firebase-service';
import { Task } from '@/lib/types';
import { Bell } from 'lucide-react';

export default function AdminActions({ task }: { task: Task }) {
    const { toast } = useToast();

    const handleSendReminder = async () => {
        try {
            await createNotification({
                userId: task.clientId,
                message: `You have a payment reminder for project: ${task.projectName}.`,
                link: `/client/${task.clientId}/projects/${task.id}`,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
            toast({
                title: "Reminder Sent!",
                description: "A payment reminder has been sent to the client.",
            });
        } catch (error) {
             toast({
                title: "Error",
                description: "Could not send reminder.",
                variant: 'destructive',
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button onClick={handleSendReminder} className="w-full">
                    <Bell className="mr-2 h-4 w-4" />
                    Send Payment Reminder
                </Button>
            </CardContent>
        </Card>
    );
}
