
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Eye, EyeOff } from 'lucide-react';
import { getClientByEmail } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, signOut } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase';

export default function ClientLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        if (!email || !password) {
            toast({
                title: 'Login Failed',
                description: 'Please enter both email and password.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }
        
        try {
            const clientRecord = await getClientByEmail(email);

            if (!clientRecord) {
                 throw new Error("This email does not belong to a registered client.");
            }

            await setPersistence(clientAuth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
            
            const clientId = userCredential.user.uid;

            if (clientId !== clientRecord.id) {
                throw new Error("Mismatched user ID. Please contact support.");
            }
            
            toast({
                title: 'Login Successful!',
                description: `Welcome back, ${clientRecord.name}!`,
            });
            router.push(`/client/${clientId}`);

        } catch (error: unknown) {
            console.error("[ClientLoginPage] Login error:", error);
            await signOut(clientAuth);
            toast({
                title: 'Login Failed',
                description: error instanceof Error ? error.message : 'Invalid credentials or not a registered client.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
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
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative flex items-center">
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="pr-10"/>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login as Client'}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Not a client?{' '}
            <Link href="/" className="underline">
              Go to main page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
