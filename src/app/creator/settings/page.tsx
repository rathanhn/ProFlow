
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateClientPassword } from '@/lib/firebase-client-service';
import { KeyRound, Eye, EyeOff, LogOut, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getAssignee, updateAssignee, getAssigneeByEmail } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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

export default function CreatorSettingsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();

    // Redirect to parameterized settings page if no ID in URL
    useEffect(() => {
        if (!id) {
            // Try to get current user and redirect to their settings
            const currentUser = clientAuth.currentUser;
            if (currentUser && currentUser.email) {
                // Find creator by email and redirect to their settings
                getAssigneeByEmail(currentUser.email).then(creator => {
                    if (creator) {
                        router.replace(`/creator/${creator.id}/settings`);
                    } else {
                        router.replace('/creator/login');
                    }
                }).catch(() => {
                    router.replace('/creator/login');
                });
            } else {
                router.replace('/creator/login');
            }
            return;
        }
    }, [id, router]);

    // Show loading while redirecting
    if (!id) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    const [assignee, setAssignee] = useState<Assignee | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // State for profile form
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<string | undefined>('');

    // State for password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    useEffect(() => {
        const fetchAssignee = async () => {
            if (id && typeof id === 'string') {
                setIsLoading(true);
                try {
                    const assigneeData = await getAssignee(id);
                    if (assigneeData) {
                        const serializableAssignee = JSON.parse(JSON.stringify(assigneeData))
                        setAssignee(serializableAssignee);
                        setName(serializableAssignee.name || '');
                        setBio(serializableAssignee.bio || '');
                        setAvatar(serializableAssignee.avatar || '');
                    } else {
                        toast({
                            title: 'Error',
                            description: 'Creator not found.',
                            variant: 'destructive',
                        });
                        router.push('/');
                    }
                } catch (error) {
                    console.error('Error fetching creator:', error);
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch creator data.',
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
                router.push('/');
            }
        };

        fetchAssignee();
    }, [id, toast, router]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut(clientAuth);
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out.'
            });
            router.push('/creator/login');
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

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ title: "Passwords don't match", variant: 'destructive'});
            return;
        }
         if (newPassword.length < 6) {
            toast({ title: "Password must be at least 6 characters", variant: 'destructive'});
            return;
        }

        if (id && typeof id === 'string') {
            try {
                await updateClientPassword(id, currentPassword, newPassword);
                toast({
                    title: 'Success',
                    description: 'Password updated successfully.',
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } catch (error: unknown) {
                console.error('Error updating password:', error);
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to update password.',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (id && typeof id === 'string') {
            try {
                const updatedData: Partial<Assignee> = { name, bio, avatar };
                await updateAssignee(id, updatedData);
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully.',
                });
                router.refresh();
            } catch (error: unknown) {
                console.error('Error updating profile:', error);
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to update profile.',
                    variant: 'destructive',
                });
            }
        }
    };
    
     const handleAvatarUpload = async (url: string | undefined) => {
        setAvatar(url);
        if (id && typeof id === 'string') {
             try {
                await updateAssignee(id, { avatar: url });
                toast({
                    title: 'Success',
                    description: 'Avatar updated successfully.',
                });
                router.refresh();
            } catch (error: unknown) {
                 toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to update avatar.',
                    variant: 'destructive',
                });
            }
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
                                <Skeleton className="h-24 w-24 rounded-full" />
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

                    {/* Profile Settings Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Manage your public profile information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="flex flex-col items-center">
                                    <ImageUploader 
                                        value={avatar} 
                                        onChange={handleAvatarUpload} 
                                        fallbackText={name.charAt(0) || 'C'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">Update Profile</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Password Settings Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>Update your password. Requires your current password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                               <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                               </div>
                               <div className="space-y-2">
                                   <Label htmlFor="newPassword">New Password</Label>
                                   <div className="relative">
                                        <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent" onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                               </div>
                               <div className="space-y-2">
                                   <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                   <div className="relative">
                                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                               </div>
                               <div className="flex justify-end">
                                <Button type="submit">Update Password</Button>
                               </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Theme Toggle Card */}
                     <Card>
                        <CardHeader>
                            <CardTitle>Theme</CardTitle>
                            <CardDescription>Customize your appearance.</CardDescription>
                        </CardHeader>
                         <CardContent>
                            <div className="flex items-center justify-between">
                               <p className="text-sm font-medium">Toggle dark, light, or system theme</p>
                               <ThemeToggle />
                            </div>
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
                                        Log out of your creator account and return to the login page.
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
                                                You will be logged out of your creator account and redirected to the login page.
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
