'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from "../../../../components/DashboardLayout";
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
import { KeyRound, Eye, EyeOff, User as UserIcon, Sparkles, Palette, ShieldCheck, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getAssignee, updateAssignee } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';

const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword'],
});

const profileFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().optional(),
});

export default function CreatorSettingsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { refreshUser } = useAuth();
    const [assignee, setAssignee] = useState<Assignee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            bio: '',
        },
    });

    useEffect(() => {
        const fetchAssignee = async () => {
            if (id && typeof id === 'string') {
                setIsLoading(true);
                try {
                    const assigneeData = await getAssignee(id);
                    if (assigneeData) {
                        const serializableAssignee = JSON.parse(JSON.stringify(assigneeData));
                        setAssignee(serializableAssignee);
                        profileForm.reset({
                            name: serializableAssignee.name,
                            bio: serializableAssignee.bio || '',
                        });
                    } else {
                        toast({ title: 'Error', description: 'Assignee not found.', variant: 'destructive' });
                    }
                } catch (error) {
                    console.error('Error fetching assignee:', error);
                    toast({ title: 'Error', description: 'Failed to load data.', variant: 'destructive' });
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchAssignee();
    }, [id, profileForm, toast]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-4xl mx-auto">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-4 w-72" />
                    <Skeleton className="h-[400px] w-full rounded-[2rem]" />
                </div>
            </DashboardLayout>
        );
    }

    const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
        if (id && typeof id === 'string') {
            try {
                await updateClientPassword(id, values.currentPassword, values.newPassword);
                toast({ title: 'Success', description: 'Password updated successfully.' });
                passwordForm.reset();
            } catch (error: any) {
                toast({ title: 'Error', description: error.message || 'Failed to update password.', variant: 'destructive' });
            }
        }
    };

    const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
        if (id && typeof id === 'string' && assignee) {
            try {
                const updatedAssignee: Partial<Assignee> = {
                    name: values.name,
                    bio: values.bio,
                    profilePicture: assignee.profilePicture,
                };
                await updateAssignee(id, updatedAssignee);
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, {
                        displayName: values.name,
                        photoURL: updatedAssignee.avatar || updatedAssignee.profilePicture
                    });
                    await refreshUser();
                }
                toast({ title: 'Success', description: 'Profile updated successfully.' });
                router.refresh();
            } catch (error: any) {
                toast({ title: 'Error', description: error.message || 'Failed to update profile.', variant: 'destructive' });
            }
        }
    };

    const handleProfilePictureUpload = async (url: string | undefined) => {
        if (id && typeof id === 'string' && assignee) {
            try {
                const updatedAssignee: Partial<Assignee> = { profilePicture: url };
                await updateAssignee(id, updatedAssignee);
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { photoURL: url });
                    await refreshUser();
                }
                toast({ title: 'Success', description: url ? 'Picture updated.' : 'Picture removed.' });
                router.refresh();
            } catch (error: any) {
                toast({ title: 'Error', description: error.message || 'Failed to update picture.', variant: 'destructive' });
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-12 fab-safe-bottom">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0 h-4 border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
                            Account Settings
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-border"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Configuration
                        </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Personal Information</h1>
                    <p className="text-muted-foreground text-sm font-medium">Update your digital presence and account security protocols.</p>
                </div>

                <div className="grid gap-8">
                    {/* Profile Section */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-gradient-to-br from-emerald-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                    <UserIcon className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Creator Profile</CardTitle>
                                    <CardDescription>Manage your public identity and creative bio.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[1.5rem] bg-secondary/30 border border-border/10">
                                <ImageUploader
                                    value={assignee?.profilePicture || assignee?.avatar}
                                    onChange={handleProfilePictureUpload}
                                    fallbackText={assignee?.name?.charAt(0) || 'C'}
                                />
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className="font-bold text-lg mb-1">{assignee?.name}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                                        <Mail className="h-3 w-3" /> {assignee?.email}
                                    </p>
                                </div>
                            </div>

                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your Name" {...field} className="rounded-xl bg-secondary/50 border-border/50 h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Creative Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Tell us about yourself" {...field} className="rounded-xl bg-secondary/50 border-border/50 min-h-[120px]" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                        Save Profile
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Security Section */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-gradient-to-br from-amber-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Account Security</CardTitle>
                                    <CardDescription>Keep your account protected with a strong password.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Current Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showCurrentPassword ? "text" : "password"} {...field} className="rounded-xl bg-secondary/50 border-border/50 h-11 pr-12" />
                                                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent text-muted-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">New Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type={showNewPassword ? "text" : "password"} {...field} className="rounded-xl bg-secondary/50 border-border/50 h-11 pr-12" />
                                                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent text-muted-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
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
                                                            <Input type={showConfirmPassword ? "text" : "password"} {...field} className="rounded-xl bg-secondary/50 border-border/50 h-11 pr-12" />
                                                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                                        Update Password
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Cosmetic Section */}
                    <Card className="glass-card border-white/20 shadow-xl overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-gradient-to-br from-indigo-500/5 to-transparent border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                                    <Palette className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Appearance</CardTitle>
                                    <CardDescription>Personalize your workspace experience.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="flex items-center justify-between p-6 rounded-2xl bg-secondary/30 border border-border/10">
                                <div>
                                    <p className="font-bold text-sm">Interface Theme</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Switch between dark and light modes.</p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
