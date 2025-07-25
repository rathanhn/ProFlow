
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
import { KeyRound, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import ImageUploader from '@/components/ImageUploader';
import { useSidebar } from '@/components/ui/sidebar';
import { updateAuthUser } from '@/lib/firebase-service';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'firebase/auth';


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


function SettingsForm() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, loading: userLoading } = useSidebar();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: 'Admin',
            avatar: '',
        },
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.displayName || 'Admin',
                avatar: user.photoURL || '',
            });
        }
    }, [user, profileForm]);

    async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
        try {
            toast({
                title: 'Password Updated!',
                description: 'Your password has been successfully changed.',
            });
            passwordForm.reset();
        } catch (error) {
            console.error("Failed to update password:", error);
            toast({
                title: 'Error',
                description: 'Failed to update password. Please try again.',
                variant: 'destructive'
            });
        }
    }

    async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        if (!user) {
             toast({ title: 'Not Authenticated', description: 'You must be logged in to update your profile.', variant: 'destructive' });
             return;
        }

        try {
            await updateAuthUser(user.uid, { displayName: values.name, photoURL: values.avatar });
            toast({
                title: 'Profile Updated!',
                description: 'Your profile information has been saved.',
            });
            router.refresh();

        } catch (error) {
            console.error("Failed to update profile:", error);
            toast({ title: 'Error', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
        }
    }
    
    if (userLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <Skeleton className="h-10 w-32 mt-4" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <div className="flex justify-end">
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                         <Skeleton className="h-6 w-1/4" />
                         <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                         <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
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
        )
    }

    return (
         <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Profile</CardTitle>
                        <CardDescription>Update your administrator name and avatar.</CardDescription>
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
                                          fallbackText={profileForm.getValues('name')?.charAt(0) || 'A'}
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
                                            <FormLabel>Admin Name</FormLabel>
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
                                    <Button type="submit" disabled={profileForm.formState.isSubmitting || userLoading}>
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
                        <CardDescription>
                            Customize the look and feel of your dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                       <p className="text-sm font-medium">Toggle dark, light, or system theme</p>
                       <ThemeToggle />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Enter a new password for your account below.
                        </CardDescription>
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
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
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

            </div>
    )
}


export default function AdminSettingsPage() {
    return (
        <DashboardLayout>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your admin dashboard settings.</p>
            </div>
            <div className="pt-6">
                <SettingsForm />
            </div>
        </DashboardLayout>
    );
}
