
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    // Hardcoded admin credentials
    if (email !== 'admin@proflow.app' || password !== 'password123') {
        toast({
            title: 'Login Failed',
            description: 'Invalid credentials for admin.',
            variant: 'destructive',
        });
        return;
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: 'Admin Login Successful!',
            description: 'Redirecting to the dashboard.',
        });
        router.push('/admin');
    } catch (error) {
        console.error("Admin login error:", error);
        toast({
            title: 'Login Failed',
            description: 'Could not sign in the admin user. Please check credentials or Firebase setup.',
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
                    <Rocket className="w-8 h-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-3xl font-bold">ProFlow - Admin</CardTitle>
          <CardDescription>Sign in to the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </div>
           <div className="mt-4 text-center text-sm">
            Are you a client?{' '}
            <Link href="/" className="underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
