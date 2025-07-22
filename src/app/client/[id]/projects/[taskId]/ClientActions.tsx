
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bell, Zap } from 'lucide-react';

export default function ClientActions() {
    const { toast } = useToast();

    const handleNotify = () => {
        toast({
            title: "Admin Notified!",
            description: "We've notified the admin that you've completed payment for this project.",
        });
    };

    const handlePrioritize = () => {
        toast({
            title: "Request Sent!",
            description: "We've sent a request to prioritize this project.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Client Actions</CardTitle>
                <CardDescription>Need something for this project?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button onClick={handleNotify} variant="outline" className="w-full">
                    <Bell className="mr-2 h-4 w-4" />
                    Notify Admin of Payment
                </Button>
                <Button onClick={handlePrioritize} variant="outline" className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Request Prioritization
                </Button>
            </CardContent>
        </Card>
    );
}
