'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, User } from 'lucide-react';
import { clients } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


export default function ClientLoginPage() {
    const [selectedClientId, setSelectedClientId] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = () => {
        const client = clients.find(c => c.id === selectedClientId);
        if (client && client.password === password) {
            toast({
                title: 'Login Successful!',
                description: `Welcome back, ${client.name}.`,
            });
            router.push(`/client/${client.id}`);
        } else {
            toast({
                title: 'Login Failed',
                description: 'Invalid client or password. Please try again.',
                variant: 'destructive',
            });
        }
    };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <div className="p-3 bg-primary rounded-full">
                    <User className="w-8 h-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-3xl font-bold">Client Portal</CardTitle>
          <CardDescription>Welcome back! Sign in to view your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="client">Select Your Account</Label>
                 <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your name" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Button onClick={handleLogin} className="w-full" disabled={!selectedClientId || !password}>
                Login as Client
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Are you an admin?{' '}
            <Link href="/admin/login" className="underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
