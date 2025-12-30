'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateClientPassword } from '@/lib/firebase-client-service';
import { KeyRound, Eye, EyeOff, User as UserIcon, LogOut, AlertTriangle, ShieldCheck, Palette, Sparkles, Mail, Lock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getClient, updateClient } from '@/lib/firebase-service';
import { Client } from '@/lib/types';
import { updateProfile, signOut } from 'firebase/auth';
import { useAuth } from '@/components/AuthProvider';
import ImageUploader from '@/components/ImageUploader';
import { Skeleton } from '@/components/ui/skeleton';
import { clientAuth } from '@/lib/firebase';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const passwordFormSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters.'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

const profileFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    avatar: z.string().url('Avatar must be a valid URL.').or(z.literal('')),
});

export default function ClientSettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const clientId = params.id as string;
    const { user, refreshUser } = useAuth();

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { name: '', avatar: '' },
    });

    useEffect(() => {
        if (clientId) {
            const fetchClient = async () => {
                const clientData = await getClient(clientId);
                if (clientData) {
                    setClient(clientData);
                    profileForm.reset({
                        name: clientData.name,
                        avatar: clientData.avatar || '',
                    });
                }
                setLoading(false);
            };
            fetchClient();
        }
    }, [clientId, profileForm]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut(clientAuth);
            toast({ title: 'Logged Out', description: 'Your session has been securely closed.' });
            router.push('/client-login');
        } catch (error) {
            toast({ title: 'Logout Failed', description: 'Session termination interrupted.', variant: 'destructive' });
        } finally {
            setIsLoggingOut(false);
        }
    };

    async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
        try {
            toast({ title: 'Security Updated', description: 'Your account password has been modified.' });
            passwordForm.reset();
        } catch (error) {
            toast({ title: 'Security Error', description: 'Could not update password credentials.', variant: 'destructive' });
        }
    }

    async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        try {
            await updateClient(clientId, { name: values.name, avatar: values.avatar });
            if (clientAuth.currentUser) {
                await updateProfile(clientAuth.currentUser, { displayName: values.name, photoURL: values.avatar });
                await refreshUser();
            }
            toast({ title: 'Workspace Updated', description: 'Your partner profile information is now live.' });
        } catch (error) {
            toast({ title: 'Update Error', description: 'Failed to synchronize workspace details.', variant: 'destructive' });
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-4xl mx-auto w-full">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-4 w-72" />
                    <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-12 fab-safe-bottom w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0 h-4 border-indigo-500/20 text-indigo-600 bg-indigo-500/5">
                            Partner Account
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-border"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Profile Management
                        </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Your Workspace</h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage your partner identity, security preferences, and interface appearance.</p>
                </div>

                <div className="grid gap-8">
                    {/* Partner Profile Section */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-gradient-to-br from-indigo-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Client Identity</CardTitle>
                                    <CardDescription>Update your partner name and avatar.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                                    <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-[2rem] bg-secondary/30 border border-border/10">
                                        <FormField
                                            control={profileForm.control}
                                            name="avatar"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <ImageUploader
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            fallbackText={profileForm.getValues('name')?.charAt(0) || 'C'}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex-1 space-y-1 text-center sm:text-left">
                                            <h4 className="font-black text-lg tracking-tight">{client?.name || 'Partner'}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 font-bold uppercase tracking-wider">
                                                <Mail className="h-3 w-3" /> {client?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Full Partner Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500/50" />
                                                        <Input placeholder="Enter full name" {...field} className="pl-12 rounded-2xl bg-secondary/50 border-border/50 h-12 font-medium" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl h-12 px-10 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full sm:w-auto">
                                        Save Changes
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-gradient-to-br from-violet-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-violet-500/10 rounded-xl">
                                    <Lock className="h-5 w-5 text-violet-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Account Security</CardTitle>
                                    <CardDescription>Manage your workspace credentials.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">New Secure Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-500/50" />
                                                            <Input type={showNewPassword ? 'text' : 'password'} {...field} className="pl-12 pr-12 rounded-2xl bg-secondary/50 border-border/50 h-12 font-medium" />
                                                            <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Confirm New Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-500/50" />
                                                            <Input type={showConfirmPassword ? 'text' : 'password'} {...field} className="pl-12 pr-12 rounded-2xl bg-secondary/50 border-border/50 h-12 font-medium" />
                                                            <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl h-12 px-10 shadow-lg shadow-violet-500/20 active:scale-95 transition-all w-full sm:w-auto">
                                        Update Password
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Interface Appearance Card */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-gradient-to-br from-indigo-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                                    <Palette className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Interface Palette</CardTitle>
                                    <CardDescription>Customize your workspace appearance.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/30 border border-border/10">
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tight">System Theme</p>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium italic">Toggle between light and dark display modes.</p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-500/20 bg-red-500/5 overflow-hidden rounded-[2.5rem] shadow-xl">
                        <CardContent className="p-8">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500/20 rounded-2xl">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg tracking-tight text-red-700 uppercase">Secure Logout</h4>
                                        <p className="text-xs text-red-600/70 font-bold uppercase tracking-widest mt-1">End your current partner session.</p>
                                    </div>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                                            <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-[2.5rem] border-red-500/20 glass-card">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-2xl font-black tracking-tighter text-red-700">Ready to Disconnect?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-sm font-medium">
                                                You will be logged out of your workspace. You can return at any time to resume collaboration.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-6">
                                            <AlertDialogCancel className="rounded-2xl font-bold">Stay Connected</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black">
                                                Sign Out
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
