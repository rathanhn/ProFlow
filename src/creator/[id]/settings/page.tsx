
'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
// import DashboardLayout from "@/components/DashboardLayout";
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
import { KeyRound, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getAssignee, updateAssignee } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

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

const settingsFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
    profilePicture: z.string().optional(),
});

export default function CreatorSettingsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
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
                        setAssignee(assigneeData);
                        profileForm.reset({
                            name: assigneeData.name,
                            bio: assigneeData.bio || '',
                        });
                    } else {
                        toast({
                            title: 'Error',
                            description: 'Assignee not found.',
                            variant: 'destructive',
                        });
                        // Optionally redirect if assignee not found
                        // router.push('/creator/dashboard');
                    }
                } catch (error) {
                    console.error('Error fetching assignee:', error);
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch assignee data.',
                        variant: 'destructive',
                    });
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
                toast({
                    title: 'Error',
                    description: 'Invalid creator ID.',
                    variant: 'destructive',
                });
                // Optionally redirect for invalid ID
                // router.push('/creator/dashboard');
            }
        };

        fetchAssignee();
    }, [id, toast, profileForm]);

    const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
        if (id && typeof id === 'string') {
            try {
                await updateClientPassword(id, values.currentPassword, values.newPassword);
                toast({
                    title: 'Success',
                    description: 'Password updated successfully.',
                });
                passwordForm.reset();
            } catch (error: any) {
                console.error('Error updating password:', error);
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to update password.',
                    variant: 'destructive',
                });
            }
        } else {
            toast({
                title: 'Error',
                description: 'Invalid creator ID.',
                variant: 'destructive',
            });
        }
    };

    const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
        if (id && typeof id === 'string' && assignee) {
            try {
                const updatedAssignee: Partial<Assignee> = {
                    name: values.name,
                    bio: values.bio,
                    // Keep existing profile picture if not updated
                    profilePicture: assignee.profilePicture,
                };

                await updateAssignee(id, updatedAssignee);
                setAssignee(prev => prev ? { ...prev, ...updatedAssignee } : null);
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully.',
                });
            } catch (error: any) {
                console.error('Error updating profile:', error);
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to update profile.',
                    variant: 'destructive',
                });
            }
        } else {
            toast({
                title: 'Error',
                description: 'Invalid creator ID or assignee data missing.',
                variant: 'destructive',
            });
        }
    };

    const handleProfilePictureUpload = async (url: string) => {
        if (id && typeof id === 'string' && assignee) {
            try {
                const updatedAssignee: Partial<Assignee> = {
                    profilePicture: url,
                };
                await updateAssignee(id, updatedAssignee);
                setAssignee(prev => prev ? { ...prev, profilePicture: url } : null);
                toast({
                    title: 'Success',
                    description: 'Profile picture updated successfully.',
                });
            } catch (error: any) {
                console.error('Error updating profile picture:', error);
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to update profile picture.',
                    variant: 'destructive',
                });
            }
        } else {
            toast({
                title: 'Error',
                description: 'Invalid creator ID or assignee data missing.',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <Skeleton className="h-[30px] w-[200px]" />
                    <Skeleton className="h-[20px] w-[300px]" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-[20px] w-[150px]" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-[50px] w-full" />
                            <Skeleton className="h-[50px] w-full" />
                            <Skeleton className="h-[50px] w-full" />
                            <Skeleton className="h-[40px] w-[100px]" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-[20px] w-[150px]" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <Skeleton className="h-[40px] w-[150px]" />
                             </div>
                            <Skeleton className="h-[50px] w-full" />
                            <Skeleton className="h-[100px] w-full" />
                            <Skeleton className="h-[40px] w-[100px]" />
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

                    {/* Password Settings Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Update your password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        >
                                                            {showCurrentPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showNewPassword ? "text" : "password"}
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                        >
                                                            {showNewPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
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
                                                    <div className="relative">
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Update Password</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Profile Settings Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Manage your profile information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center space-x-4">
                                <ImageUploader onUploadComplete={handleProfilePictureUpload} />
                                 {assignee?.profilePicture && (
                                    <img src={assignee.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                )}
                             </div>
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your Name" {...field} />
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
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Tell us about yourself" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Update Profile</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Theme Toggle Card */}
                     <Card>
                        <CardHeader>
                            <CardTitle>Theme</CardTitle>
                            <CardDescription>Customize your appearance.</CardDescription>
                        </CardHeader>
                         <CardContent>
                            <ThemeToggle />
                         </CardContent>
                     </Card>
                </div>
            </DashboardLayout>

);
}
