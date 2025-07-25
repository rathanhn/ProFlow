
'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
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
import { getAssignee, updateAssignee } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const passwordFormSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters.'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  avatar: z.string().url('Avatar must be a valid URL.'),
  description: z.string().optional(),
  mobile: z.string().optional(),
});

export default function CreatorSettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const assigneeId = params.id as string;

    const [creator, setCreator] = useState<Assignee | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: { name: '', avatar: '', description: '', mobile: '' },
    });
    
    useEffect(() => {
        if (assigneeId) {
            const fetchCreator = async () => {
                const creatorData = await getAssignee(assigneeId);
                if (creatorData) {
                    setCreator(creatorData);
                    profileForm.reset({
                        name: creatorData.name,
                        avatar: creatorData.avatar,
                        description: creatorData.description || '',
                        mobile: creatorData.mobile || '',
                    });
                }
                setLoading(false);
            };
            fetchCreator();
        }
    }, [assigneeId, profileForm]);

    async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
        try {
            await updateClientPassword(values.newPassword);
            toast({ title: 'Password Updated!', description: 'Your password has been successfully changed.' });
            passwordForm.reset();
        } catch (error) {
            console.error("Failed to update password:", error);
            toast({ title: 'Error', description: 'Failed to update password. Please try again.', variant: 'destructive' });
        }
    }
    
    async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        try {
            await updateAssignee(assigneeId, values);
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
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                    <Card>
                        <CardHeader>
                             <Skeleton className="h-6 w-1/4" />
                             <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
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
                    <p className="text-muted-foreground">Manage your creator account and profile settings.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your public name, avatar, and other details.</CardDescription>
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
                                        <ImageUploader value={field.value} onChange={field.onChange} fallbackText={profileForm.getValues('name')?.charAt(0) || 'C'}/>
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
                                <FormField control={profileForm.control} name="mobile" render={({ field }) => (
                                    <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="+1234567890" {...field} /></FormControl><FormMessage /></Item>
                                )}/>
                                 <FormField control={profileForm.control} name="description" render={({ field }) => (
                                    <FormItem><FormLabel>Bio / Description</FormLabel><FormControl><Textarea placeholder="Tell us a bit about yourself" {...field} /></FormControl><FormMessage /></Item>
                                )}/>
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
        </DashboardLayout>
    );
}
