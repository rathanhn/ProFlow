
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

export default function AdminActions() {
    const { toast } = useToast();

    const handleSendReminder = () => {
        toast({
            title: "Reminder Sent!",
            description: "A payment reminder has been sent to the client.",
        });
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
