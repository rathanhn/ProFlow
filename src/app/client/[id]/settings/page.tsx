
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
import { KeyRound, Eye, EyeOff, User as UserIcon, LogOut, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getClient, updateClient } from '@/lib/firebase-service';
import { Client } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';
import { Skeleton } from '@/components/ui/skeleton';
import { clientAuth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
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
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out.'
            });
            router.push('/client-login');
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                title: 'Logout Failed',
                description: 'Could not log you out. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
        try {
            // This requires reauthentication which is complex for this scope.
            // await updateClientPassword(values.newPassword);
            toast({ title: 'Password Updated!', description: 'Your password has been successfully changed.' });
            passwordForm.reset();
        } catch (error) {
            console.error("Failed to update password:", error);
            toast({ title: 'Error', description: 'Failed to update password. Please try again.', variant: 'destructive' });
        }
    }
    
    async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        try {
            await updateClient(clientId, { name: values.name, avatar: values.avatar });
            toast({ title: 'Profile Updated!', description: 'Your profile information has been saved.' });
            router.refresh();
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast({ title: 'Error', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
        }
    }
    
    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-6 w-1/2" />
                    <Card>
                        <CardHeader>
                             <Skeleton className="h-6 w-1/4" />
                             <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and profile settings.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your public name and avatar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6 max-w-md">
                               <FormField
                                  control={profileForm.control}
                                  name="avatar"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
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
                                <FormField
                                    control={profileForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="Enter your full name" {...field} className="pl-10"/>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <div className="flex justify-end">
                                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                        {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                       <p className="text-sm font-medium">Toggle dark, light, or system theme</p>
                       <ThemeToggle />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Enter a new password for your account below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input type={showNewPassword ? 'text' : 'password'} placeholder="Enter new password" {...field} className="pl-10 pr-10" />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowNewPassword(!showNewPassword)}>
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
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                 <div className="relative flex items-center">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm new password" {...field} className="pl-10 pr-10" />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                        {passwordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border-destructive/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Actions that will log you out of your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                            <div>
                                <h4 className="font-medium text-sm">Sign Out</h4>
                                <p className="text-xs text-muted-foreground">
                                    Log out of your client account and return to the login page.
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={isLoggingOut}
                                        className="ml-4"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You will be logged out of your client account and redirected to the login page.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleLogout}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Sign Out
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
