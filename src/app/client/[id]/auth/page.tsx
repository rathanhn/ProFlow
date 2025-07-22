
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getClientByEmail } from '@/lib/firebase-service';
import { app } from '@/lib/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Eye, EyeOff } from 'lucide-react';

const auth = getAuth(app);

export default function ClientAuthPage({ params }: { params: { id: string } }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [client, setClient] = useState<any>(null);
    const router = useRouter();
    const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    useEffect(() => {
        const fetchClientEmail = async () => {
            // In a real application, you might fetch the client's email based on the ID
            // For this example, I'll assume the ID is the email for simplicity.
            // You should replace this with your actual logic to get the client email.
            setEmail(`${params.id}@example.com`); // Replace with actual email fetching logic
        };

        fetchClientEmail();
    }, [params.id]);

    const handleSignIn = async () => {
                setIsLoading(true);
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;

                    // Fetch client data after successful sign-in
                    const client = await getClientByEmail(user.email);

                    if (!client) {
                        toast({
                            title: 'Login Failed',
                            description: 'Client data not found.',
                            variant: 'destructive',
                        });
                        setIsLoading(false);
                        return;
                    }

                    // Create a plain object from the user data
                    const plainUser = {
                      uid: user.uid,
                      email: user.email,
                      // Add any other necessary user properties here
                    };

                    // You might also need to ensure the client object is plain
                    const plainClient = {
                        id: client.id,
                        name: client.name,
                        avatar: client.avatar,
                        dataAiHint: client.dataAiHint,
                        // Add any other necessary client properties here
                    };


                    setClient(plainClient); // Assuming setClient is used to store client data

                    // Check if lastSignInTime is within 5 seconds of creationTime (adjust time accordingly)
                    const lastSignInTime = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : 0;
                    const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;


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
                } finally {
                    setIsLoading(false);
                }
            };




    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            toast({
                title: 'Password Reset Failed',
                description: 'New passwords do not match.',
                variant: 'destructive',
            });
            return;
        }

        // In a real application, you would implement the password reset logic here.
        // This might involve updating the password in Firebase Authentication
        // and potentially updating your database if you store password-related info.
        console.log('Password reset logic goes here');

        toast({
            title: 'Password Reset Successful',
            description: 'Your password has been updated.',
        });

        setShowPasswordResetDialog(false);
        // Redirect the user to their dashboard after password reset
        if (client) {
             router.push(`/client/${client.id}`);
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
