
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, updatePassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getClient } from '@/lib/firebase-service';
import { clientAuth } from '@/lib/firebase';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Eye, EyeOff } from 'lucide-react';
import type { Client } from '@/lib/types';

type Props = {
    params: { id: string };
};

export default function ClientAuthPage({ params }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [client, setClient] = useState<Client | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    useEffect(() => {
        const fetchClientData = async () => {
            const clientData = await getClient(params.id);
            if (clientData) {
                const serializableClient = JSON.parse(JSON.stringify(clientData)) as Client;
                setClient(serializableClient);
                setEmail(serializableClient.email);
            }
        };

        fetchClientData();
    }, [params.id]);

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            await setPersistence(clientAuth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
            const user = userCredential.user;

            // Check if this is the first sign-in
            const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();
            const creationTime = new Date(user.metadata.creationTime || 0).getTime();

            if (Math.abs(lastSignInTime - creationTime) < 5000) { // First login is usually within a few seconds of creation
                setShowPasswordResetDialog(true);
            } else {
                toast({ title: 'Access Granted!', description: 'Redirecting to your dashboard...' });
                router.push(`/client/${user.uid}`);
            }
        } catch (error) {
            console.error("[ClientAuthPage] Sign-in error:", error);
            toast({ title: 'Access Denied', description: 'Incorrect password. Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            toast({ title: 'Password Reset Failed', description: 'New passwords do not match.', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: 'Password Too Short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
            return;
        }

        const user = clientAuth.currentUser;
        if (user) {
            try {
                await updatePassword(user, newPassword);
                toast({ title: 'Password Reset Successful', description: 'Your password has been updated. Redirecting...' });
                setShowPasswordResetDialog(false);
                router.push(`/client/${user.uid}`);
            } catch (error) {
                console.error("[ClientAuthPage] Password reset error:", error);
                toast({ title: 'Password Reset Failed', description: 'Could not update password. Please try again.', variant: 'destructive' });
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-sm mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Client Portal Login</CardTitle>
                    <CardDescription>Enter your password to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                         <div className="relative flex items-center">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                                className="pr-10"
                            />
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
                    <Button onClick={handleSignIn} disabled={isLoading || !email} className="w-full">
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </CardContent>
            </Card>

             <AlertDialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
                <AlertDialogContent>
                 <AlertDialogHeader>
                 <AlertDialogTitle>Welcome! Let's secure your account.</AlertDialogTitle>
                 <AlertDialogDescription>
                     This is your first time logging in. For your security, please set a new, permanent password.
                 </AlertDialogDescription>
                 </AlertDialogHeader>
                 <div className="space-y-4 py-4">
                     <div className="space-y-2">
                         <Label htmlFor="new-password">New Password</Label>
                          <div className="relative flex items-center">
                             <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter your new password" className="pr-10" />
                             <Button
                                 type="button"
                                 variant="ghost"
                                 size="icon"
                                 className="absolute right-0 h-full px-3 py-2 hover:bg-transparent"
                                 onClick={() => setShowNewPassword(!showNewPassword)}
                                 >
                                 {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                             </Button>
                         </div>
                     </div>
                     <div className="space-y-2">
                         <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                          <div className="relative flex items-center">
                             <Input id="confirm-new-password" type={showConfirmNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirm your new password" className="pr-10" />
                             <Button
                                 type="button"
                                 variant="ghost"
                                 size="icon"
                                 className="absolute right-0 h-full px-3 py-2 hover:bg-transparent"
                                 onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                 >
                                 {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                             </Button>
                         </div>
                     </div>
                 </div>
                 <AlertDialogFooter>
                    <Button onClick={handlePasswordReset}>Set New Password</Button>
                 </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
