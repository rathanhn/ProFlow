'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
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

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, loading: userLoading, refreshUser } = useAuth();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { name: user?.displayName || 'Admin', avatar: user?.photoURL || '' },
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.displayName || 'Admin',
                avatar: user.photoURL || '',
            });
        }
    }, [user, profileForm]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut(auth);
            toast({ title: 'Logged Out', description: 'Session terminated successfully.' });
            router.push('/admin/login');
        } catch (error) {
            toast({ title: 'Logout Failed', description: 'Critical error during session termination.', variant: 'destructive' });
        } finally {
            setIsLoggingOut(false);
        }
    };

    async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
        try {
            toast({ title: 'Security Protocol Updated', description: 'Your password has been successfully modified.' });
            passwordForm.reset();
        } catch (error) {
            toast({ title: 'Security Error', description: 'Failed to update credentials.', variant: 'destructive' });
        }
    }

    async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        try {
            await updateProfile(currentUser, { displayName: values.name, photoURL: values.avatar });
            await refreshUser();
            toast({ title: 'Profile Synchronized', description: 'Administrative details updated successfully.' });
        } catch (error) {
            toast({ title: 'System Error', description: 'Failed to synchronize profile data.', variant: 'destructive' });
        }
    }

    if (userLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-4xl mx-auto w-full">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-4 w-72" />
                    <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
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
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0 h-4 border-blue-500/20 text-blue-600 bg-blue-500/5">
                            System Control
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-border"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Administrative Console
                        </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Global Settings</h1>
                    <p className="text-muted-foreground text-sm font-medium">Configure global administrative protocols and system appearance.</p>
                </div>

                <div className="grid gap-8">
                    {/* Admin Profile Section */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-gradient-to-br from-blue-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Super Admin Profile</CardTitle>
                                    <CardDescription>System-wide administrative identity.</CardDescription>
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
                                                            fallbackText={profileForm.getValues('name')?.charAt(0) || 'A'}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex-1 space-y-1 text-center sm:text-left">
                                            <h4 className="font-black text-lg tracking-tight">{user?.displayName || 'Administrator'}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 font-bold uppercase tracking-wider">
                                                <Mail className="h-3 w-3" /> {user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Legal Admin Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/50" />
                                                        <Input placeholder="Enter full name" {...field} className="pl-12 rounded-2xl bg-secondary/50 border-border/50 h-12 font-medium" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-12 px-10 shadow-lg shadow-blue-500/20 active:scale-95 transition-all w-full sm:w-auto">
                                        Update Credentials
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-gradient-to-br from-amber-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                    <Lock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Access Security</CardTitle>
                                    <CardDescription>Rotate administrative passwords.</CardDescription>
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
                                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
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
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Confirm High-Security Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
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
                                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl h-12 px-10 shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-full sm:w-auto">
                                        Rotate Password
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Visual Interface Card */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="bg-gradient-to-br from-indigo-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                                    <Palette className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Interface Dynamics</CardTitle>
                                    <CardDescription>Customize global UI behavior.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/30 border border-border/10">
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tight">System Theme</p>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium italic">Toggle between high-contrast light and deep OLED dark modes.</p>
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
                                        <h4 className="font-black text-lg tracking-tight text-red-700 uppercase">Session Termination</h4>
                                        <p className="text-xs text-red-600/70 font-bold uppercase tracking-widest mt-1">Disconnect from the administrative matrix.</p>
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
                                            <AlertDialogTitle className="text-2xl font-black tracking-tighter text-red-700">Confirm Termination?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-sm font-medium">
                                                This will disconnect your administrative session. All unsaved system configurations may be lost.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-6">
                                            <AlertDialogCancel className="rounded-2xl font-bold">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black">
                                                Terminate Session
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
