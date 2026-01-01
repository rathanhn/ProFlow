
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { getClient } from '@/lib/firebase-service';
import { clientAuth } from '@/lib/firebase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, LayoutDashboard, Lock, ArrowRight, ShieldCheck, Zap, Sparkles, KeyRound } from 'lucide-react';
import type { Client } from '@/lib/types';

export default function ClientAuthPage() {
    const params = useParams();
    const clientId = params.id as string;
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
            const clientData = await getClient(clientId);
            if (clientData) {
                const serializableClient = JSON.parse(JSON.stringify(clientData)) as Client;
                setClient(serializableClient);
                setEmail(serializableClient.email);
            }
        };

        fetchClientData();
    }, [clientId]);

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
            const user = userCredential.user;

            const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();
            const creationTime = new Date(user.metadata.creationTime || 0).getTime();

            if (Math.abs(lastSignInTime - creationTime) < 10000) {
                setShowPasswordResetDialog(true);
            } else {
                toast({ title: 'Success!', description: 'Redirecting to your dashboard...' });
                router.push(`/client/${user.uid}`);
            }
        } catch (error) {
            console.error("[ClientAuthPage] Login error:", error);
            toast({ title: 'Login Failed', description: 'Incorrect password. Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            toast({ title: 'Passwords Match Error', description: 'The new passwords do not match.', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 8) {
            toast({ title: 'Password Too Short', description: 'Password must be at least 8 characters long.', variant: 'destructive' });
            return;
        }

        const user = clientAuth.currentUser;
        if (user) {
            setIsLoading(true);
            try {
                await updatePassword(user, newPassword);
                toast({ title: 'Account Secured', description: 'Password updated. Redirecting...' });
                setShowPasswordResetDialog(false);
                router.push(`/client/${user.uid}`);
            } catch (error) {
                console.error("[ClientAuthPage] Password reset error:", error);
                toast({ title: 'Error', description: 'Could not update password. Please try again.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 -m-20 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -m-20 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            <Card className="w-full max-w-md mx-auto relative overflow-hidden glass-card border-white/20 shadow-2xl rounded-[2.5rem]">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

                <CardHeader className="text-center pt-10 pb-6 px-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-6 animate-float">
                        <Lock className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Client Login
                    </CardTitle>
                    <CardDescription className="text-sm font-medium pt-2 max-w-[280px] mx-auto text-muted-foreground/80">
                        {client ? `Welcome back, ${client.name.split(' ')[0]}!` : 'Please login to access your projects.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-8 pb-10">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="h-12 border-white/20 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl font-bold opacity-70"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Account Password</Label>
                            <div className="relative flex items-center group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                                    className="h-12 pl-11 pr-12 border-white/20 focus:border-blue-500 bg-white/50 dark:bg-slate-900/50 rounded-xl transition-all shadow-sm font-bold"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 h-10 w-10 hover:bg-transparent text-muted-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleSignIn}
                            disabled={isLoading || !email}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                        >
                            {isLoading ? 'Verifying...' : 'Login Now'}
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/60"></span>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                                <span className="bg-slate-50 dark:bg-slate-950 px-3 text-muted-foreground/40">Quick Access</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 border-none bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 font-bold rounded-xl transition-all"
                            onClick={() => router.push(`/p/${clientId}`)}
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            View Public Dashboard
                        </Button>
                    </div>

                    <p className="text-[10px] text-center text-muted-foreground/40 font-medium">
                        Secure Authentication System
                    </p>
                </CardContent>
            </Card>

            {/* Premium Onboarding / Password Reset Modal */}
            <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="relative overflow-hidden glass-card dark:bg-slate-900/90 border border-white/20 shadow-2xl rounded-[2.5rem] p-8 sm:p-10">
                        <div className="absolute -top-24 -right-24 h-64 w-64 bg-blue-500/20 blur-[80px] rounded-full"></div>
                        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-indigo-500/20 blur-[80px] rounded-full"></div>

                        <div className="relative z-10 space-y-8">
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-600 animate-pulse">
                                    <Sparkles className="h-10 w-10" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                        Welcome!
                                    </h2>
                                    <p className="text-sm font-bold text-muted-foreground/80 mt-2 px-4 italic">
                                        &quot;This is your first login. Please set a new password to secure your account.&quot;
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest ml-1 text-blue-600/70">New Password</Label>
                                    <div className="relative flex items-center group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600/40 group-focus-within:text-blue-600 transition-colors">
                                            <KeyRound className="h-4 w-4" />
                                        </div>
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Min 8 characters"
                                            className="h-12 pl-11 pr-12 border-blue-500/20 focus:border-blue-500 bg-blue-500/5 rounded-xl transition-all shadow-inner font-bold"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 h-10 w-10 hover:bg-transparent text-muted-foreground"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest ml-1 text-indigo-600/70">Confirm Password</Label>
                                    <div className="relative flex items-center group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600/40 group-focus-within:text-indigo-600 transition-colors">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <Input
                                            type={showConfirmNewPassword ? 'text' : 'password'}
                                            value={confirmNewPassword}
                                            onChange={e => setConfirmNewPassword(e.target.value)}
                                            placeholder="Repeat password"
                                            className="h-12 pl-11 pr-12 border-indigo-500/20 focus:border-indigo-500 bg-indigo-500/5 rounded-xl transition-all shadow-inner font-bold"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 h-10 w-10 hover:bg-transparent text-muted-foreground"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                        >
                                            {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handlePasswordReset}
                                disabled={isLoading || !newPassword}
                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 transition-all"
                            >
                                {isLoading ? 'Updating...' : 'Set Password & Start'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
