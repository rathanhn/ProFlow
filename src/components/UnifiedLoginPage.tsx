
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
    Zap,
    Rocket,
    Terminal,
    Sparkles,
    KeyRound
} from 'lucide-react';
import { signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';
import { auth, clientAuth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { getAdminByEmail, getClientByEmail, getAssigneeByEmail } from '@/lib/firebase-service';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function UnifiedLoginPage({ defaultTab = 'client' }: { defaultTab?: string }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    // Password Reset State (for first-time users)
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [isResetSuccess, setIsResetSuccess] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Clear fields when switching tabs
    useEffect(() => {
        setEmail('');
        setPassword('');
    }, [activeTab]);

    const handleLogin = async () => {
        if (!email || !password) {
            toast({
                title: 'Input Required',
                description: 'Please enter both email and password.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            if (activeTab === 'admin') {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const adminRecord = await getAdminByEmail(email);
                if (!adminRecord) {
                    await signOut(auth);
                    throw new Error("You do not have administrative permissions.");
                }
                toast({ title: 'Success', description: 'Welcome to Admin Nexus.' });
                router.push('/admin');
            } else if (activeTab === 'client') {
                const clientRecord = await getClientByEmail(email);
                if (!clientRecord) throw new Error("This email is not registered as a client.");

                const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
                const user = userCredential.user;

                if (checkFirstTime(user)) {
                    setShowResetDialog(true);
                } else {
                    toast({ title: 'Success', description: `Welcome back, ${clientRecord.name.split(' ')[0]}!` });
                    router.push(`/client/${user.uid}`);
                }
            } else if (activeTab === 'creator') {
                const creatorRecord = await getAssigneeByEmail(email);
                if (!creatorRecord) throw new Error("This email is not registered as a creator.");

                const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
                const user = userCredential.user;

                if (checkFirstTime(user)) {
                    setShowResetDialog(true);
                } else {
                    toast({ title: 'Success', description: `Welcome back, ${creatorRecord.name.split(' ')[0]}!` });
                    router.push(`/creator/${creatorRecord.id}`);
                }
            }
        } catch (error: any) {
            console.error("Login error:", error);
            toast({
                title: 'Login Failed',
                description: error.message || 'Invalid credentials. Please try again.',
                variant: 'destructive',
            });
            // Ensure we sign out if a check failed after auth
            if (activeTab === 'admin') await signOut(auth).catch(() => { });
            else await signOut(clientAuth).catch(() => { });
        } finally {
            setIsLoading(false);
        }
    };

    const checkFirstTime = (user: any) => {
        const lastSignIn = new Date(user.metadata.lastSignInTime || 0).getTime();
        const creation = new Date(user.metadata.creationTime || 0).getTime();
        return Math.abs(lastSignIn - creation) < 10000;
    };

    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 8) {
            toast({ title: 'Error', description: 'Password must be at least 8 characters.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            const user = clientAuth.currentUser;
            if (user) {
                await updatePassword(user, newPassword);
                setIsResetSuccess(true);
                toast({ title: 'Success', description: 'Password updated successfully!' });

                // Wait for animation
                setTimeout(() => {
                    setShowResetDialog(false);
                    if (activeTab === 'client') {
                        router.push(`/client/${user.uid}`);
                    } else {
                        getAssigneeByEmail(user.email || '').then(res => {
                            router.push(`/creator/${res?.id || ''}`);
                        });
                    }
                }, 2000);
            }
        } catch (error: any) {
            toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const themes = {
        admin: 'from-violet-600 to-purple-800',
        client: 'from-blue-600 to-indigo-600',
        creator: 'from-emerald-600 to-blue-600',
    };

    const currentTheme = themes[activeTab as keyof typeof themes];

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 overflow-x-hidden">
            {/* Dynamic Background Blurs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={cn(
                    "absolute top-0 right-0 -m-20 h-[500px] w-[500px] rounded-full blur-[100px] transition-all duration-1000 opacity-20",
                    activeTab === 'creator' ? 'bg-emerald-500' : activeTab === 'admin' ? 'bg-violet-500' : 'bg-blue-500'
                )} />
                <div className={cn(
                    "absolute bottom-0 left-0 -m-20 h-[500px] w-[500px] rounded-full blur-[100px] transition-all duration-1000 opacity-20",
                    activeTab === 'admin' ? 'bg-purple-900' : activeTab === 'creator' ? 'bg-blue-600' : 'bg-indigo-600'
                )} />
            </div>

            <div className="w-full max-w-md relative z-10 transition-all duration-500">
                <Card className="glass-card border-white/20 shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
                    <div className={cn("absolute top-0 inset-x-0 h-2 bg-gradient-to-r transition-all duration-500", currentTheme)} />

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <CardHeader className="text-center pt-10 pb-6 px-8">
                            <div className={cn(
                                "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 animate-float mb-6",
                                "bg-gradient-to-br", currentTheme
                            )}>
                                {activeTab === 'admin' && <Terminal className="h-8 w-8" />}
                                {activeTab === 'client' && <ShieldCheck className="h-8 w-8" />}
                                {activeTab === 'creator' && <Zap className="h-8 w-8" />}
                            </div>

                            <TabsList className="grid grid-cols-3 w-full max-w-[280px] mx-auto mb-6 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 h-11 border border-border/50">
                                <TabsTrigger value="client" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Client</TabsTrigger>
                                <TabsTrigger value="creator" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Creator</TabsTrigger>
                                <TabsTrigger value="admin" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Admin</TabsTrigger>
                            </TabsList>

                            <CardTitle className={cn(
                                "text-3xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r transition-all duration-500",
                                currentTheme
                            )}>
                                {activeTab === 'client' && 'Client Portal'}
                                {activeTab === 'creator' && 'Creator Portal'}
                                {activeTab === 'admin' && 'Admin Portal'}
                            </CardTitle>
                            <CardDescription className="text-sm font-medium pt-2 text-muted-foreground/80">
                                {activeTab === 'client' && 'Manage your projects and assets.'}
                                {activeTab === 'creator' && 'View tasks and update production.'}
                                {activeTab === 'admin' && 'Full administrative infrastructure control.'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-8 pb-10 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Email</Label>
                                    <div className="relative group">
                                        <div className={cn(
                                            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors",
                                            activeTab === 'client' && 'group-focus-within:text-blue-500',
                                            activeTab === 'creator' && 'group-focus-within:text-emerald-500',
                                            activeTab === 'admin' && 'group-focus-within:text-violet-500'
                                        )}>
                                            <User className="h-4 w-4" />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className={cn(
                                                "h-12 pl-11 border-white/20 bg-white/50 dark:bg-slate-900/50 rounded-xl transition-all shadow-sm font-bold text-sm",
                                                activeTab === 'client' && 'focus:border-blue-500',
                                                activeTab === 'creator' && 'focus:border-emerald-500',
                                                activeTab === 'admin' && 'focus:border-violet-500'
                                            )}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Password</Label>
                                    <div className="relative flex items-center group">
                                        <div className={cn(
                                            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors",
                                            activeTab === 'client' && 'group-focus-within:text-blue-500',
                                            activeTab === 'creator' && 'group-focus-within:text-emerald-500',
                                            activeTab === 'admin' && 'group-focus-within:text-violet-500'
                                        )}>
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter password"
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                            className={cn(
                                                "h-12 pl-11 pr-12 border-white/20 bg-white/50 dark:bg-slate-900/50 rounded-xl transition-all shadow-sm font-bold text-sm",
                                                activeTab === 'client' && 'focus:border-blue-500',
                                                activeTab === 'creator' && 'focus:border-emerald-500',
                                                activeTab === 'admin' && 'focus:border-violet-500'
                                            )}
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

                            <Button
                                onClick={handleLogin}
                                className={cn(
                                    "w-full h-12 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg active:scale-[0.98] transition-all duration-500 bg-gradient-to-r",
                                    currentTheme
                                )}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    `Login as ${activeTab}`
                                )}
                            </Button>

                            <div className="pt-4 border-t border-border/60 text-center">
                                <p className="text-[10px] text-muted-foreground/40 font-medium">
                                    Secure Encryption Active • v2.0
                                </p>
                            </div>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>

            {/* Onboarding Modal */}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="relative overflow-hidden glass-card dark:bg-slate-900/90 border border-white/20 shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-10">
                        <div className={cn("absolute -top-24 -right-24 h-64 w-64 blur-[80px] rounded-full opacity-30", currentTheme.includes('emerald') ? 'bg-emerald-500' : 'bg-blue-500')}></div>

                        <div className="relative z-10 space-y-8 min-h-[400px] flex flex-col items-center justify-center">
                            {isResetSuccess ? (
                                <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                                    <div className={cn("mx-auto w-24 h-24 rounded-full flex items-center justify-center shadow-2xl",
                                        activeTab === 'creator' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white')}>
                                        <ShieldCheck className="h-12 w-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className={cn("text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r", currentTheme)}>
                                            Success!
                                        </h2>
                                        <p className="font-bold text-muted-foreground italic">
                                            Your identity is secured. Redirecting to workspace...
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <Sparkles className={cn("h-6 w-6 animate-pulse", activeTab === 'creator' ? 'text-emerald-500' : 'text-blue-500')} />
                                        <Sparkles className={cn("h-6 w-6 animate-pulse delay-75", activeTab === 'creator' ? 'text-emerald-500' : 'text-blue-500')} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center space-y-4">
                                        <div className={cn("mx-auto w-20 h-20 rounded-3xl flex items-center justify-center animate-pulse", activeTab === 'creator' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600')}>
                                            <Sparkles className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h2 className={cn("text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r", currentTheme)}>
                                                Welcome!
                                            </h2>
                                            <p className="text-sm font-bold text-muted-foreground/80 mt-2 px-4 italic">
                                                This is your first login. Please set a new password to secure your portal.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 w-full">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest ml-1 opacity-60">New Password</Label>
                                            <div className="relative flex items-center group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                                                    <KeyRound className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    type={showNewPass ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    placeholder="Min 8 characters"
                                                    className="h-12 pl-11 pr-12 border-white/20 focus:border-blue-500 bg-white/10 rounded-xl font-bold"
                                                />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1" onClick={() => setShowNewPass(!showNewPass)}>
                                                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest ml-1 opacity-60">Confirm Password</Label>
                                            <div className="relative flex items-center group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                                                    <ShieldCheck className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    type={showConfirmPass ? 'text' : 'password'}
                                                    value={confirmNewPassword}
                                                    onChange={e => setConfirmNewPassword(e.target.value)}
                                                    placeholder="Repeat password"
                                                    className="h-12 pl-11 pr-12 border-white/20 focus:border-blue-500 bg-white/10 rounded-xl font-bold"
                                                />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handlePasswordReset}
                                        className={cn("w-full h-14 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all bg-gradient-to-r", currentTheme)}
                                    >
                                        {isLoading ? 'Updating...' : 'Set Password & Continue'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
