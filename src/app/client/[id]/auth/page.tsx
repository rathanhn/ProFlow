
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, User, updatePassword } from 'firebase/auth';
import { getClient, getClientByEmail } from '@/lib/firebase-service';
import { app } from '@/lib/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Eye, EyeOff } from 'lucide-react';
import { Client } from '@/lib/types';

const auth = getAuth(app);

export default function ClientAuthPage({ params }: { params: { id: string } }) {
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const clientData = await getClient(user.uid);
            if (!clientData) {
                toast({ title: 'Login Failed', description: 'Client data not found.', variant: 'destructive' });
                setIsLoading(false);
                return;
            }

            const plainClient = JSON.parse(JSON.stringify(clientData));
            setClient(plainClient);

            const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();
            const creationTime = new Date(user.metadata.creationTime || 0).getTime();

            if (Math.abs(lastSignInTime - creationTime) < 5000) {
                setShowPasswordResetDialog(true);
            } else {
                toast({ title: 'Access Granted!', description: 'Redirecting to your dashboard...' });
                router.push(`/client/${clientData.id}`);
            }
        } catch (error) {
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

        const user = auth.currentUser;
        if (user) {
            try {
                await updatePassword(user, newPassword);
                toast({ title: 'Password Reset Successful', description: 'Your password has been updated.' });
                setShowPasswordResetDialog(false);
                if (client) {
                    router.push(`/client/${client.id}`);
                }
            } catch (error) {
                toast({ title: 'Password Reset Failed', description: 'Could not update password.', variant: 'destructive' });
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Client Login</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} disabled />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                             <div className="relative flex items-center">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSignIn();
                                        }
                                    }}
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
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
