
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import { getClient } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Client } from '@/lib/types';


export default function ClientAuthPage() {
    const [password, setPassword] = useState('');
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [client, setClient] = useState<Client | null>(null);

    useEffect(() => {
        const fetchClient = async () => {
            const clientData = await getClient(id);
            if (!clientData) {
                notFound();
            }
            setClient(clientData);
        };
        if (id) {
            fetchClient();
        }
    }, [id]);


    const handleVerification = () => {
        if (client && client.password === password) {
            toast({
                title: 'Access Granted!',
                description: 'Redirecting to your dashboard...',
            });
            // In a real app, you'd set a session cookie or token here
            router.push(`/client/${client.id}`);
        } else {
            toast({
                title: 'Access Denied',
                description: 'Incorrect password. Please try again.',
                variant: 'destructive',
            });
        }
    };
  
  if (!client) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4 gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={client.avatar} data-ai-hint={client.dataAiHint} />
                    <AvatarFallback className="text-2xl">{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
          <CardTitle className="text-2xl font-bold">Welcome, {client.name}</CardTitle>
          <CardDescription>Please enter your password to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleVerification()}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Button onClick={handleVerification} className="w-full" disabled={!password}>
                Verify & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
