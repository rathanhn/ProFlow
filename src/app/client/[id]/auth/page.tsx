
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { getClient, signInClient, updateClientPassword } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Client } from '@/lib/types';
import { auth } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function ClientAuthPage() {
    const [password, setPassword] = useState('');
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [client, setClient] = useState<Client | null>(null);
    const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);


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


    const handleVerification = async () => {
        if (client) {
            try {
                const user = await signInClient(client.email, password);
                 // Check if it's the first sign-in
                const creationTime = new Date(user.metadata.creationTime).getTime();
                const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();

                if (Math.abs(lastSignInTime - creationTime) < 5000) { // e.g., within 5 seconds
                    setShowPasswordResetDialog(true);
                } else {
                    toast({
                        title: 'Access Granted!',
                        description: 'Redirecting to your dashboard...',
                    });
                    router.push(`/client/${client.id}`);
                }
            } catch (error) {
                toast({
                    title: 'Access Denied',
                    description: 'Incorrect password. Please try again.',
                    variant: 'destructive',
                });
            }
        }
    };

    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            toast({ title: "Passwords do not match.", variant: "destructive" });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }

        try {
            await updateClientPassword(newPassword);
            toast({ title: "Password updated successfully!" });
            setShowPasswordResetDialog(false);
            router.push(`/client/${id}`);
        } catch (error) {
            toast({ title: "Failed to update password.", description: "Please try again.", variant: "destructive" });
        }
    };
  
  if (!client) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <>
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
                    type={showPassword ? 'text' : 'password'}
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="pl-10 pr-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleVerification()}
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
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
    <AlertDialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Welcome! Let's secure your account.</AlertDialogTitle>
            <AlertDialogDescription>
                This is your first time logging in. For your security, we recommend setting a new password.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                        <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter your new password" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <div className="relative">
                        <Input id="confirm-new-password" type={showConfirmNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirm your new password" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            >
                            {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push(`/client/${id}`)}>Continue with old password</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordReset}>Set New Password</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
