
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Eye, EyeOff } from 'lucide-react';
import { getAssigneeByEmail } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, signOut, updatePassword } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';


export default function CreatorLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        if (!email || !password) {
            toast({ title: 'Login Failed', description: 'Please enter both email and password.', variant: 'destructive' });
            setIsLoading(false);
            return;
        }
        
        try {
            const creatorRecord = await getAssigneeByEmail(email);
            if (!creatorRecord) {
                 throw new Error("This email does not belong to a registered creator.");
            }

            await setPersistence(clientAuth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
            const user = userCredential.user;

            if (user.uid !== creatorRecord.id) {
                await signOut(clientAuth);
                throw new Error("Mismatched user ID. Please contact support.");
            }
            
            const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();
            const creationTime = new Date(user.metadata.creationTime || 0).getTime();

            if (Math.abs(lastSignInTime - creationTime) < 5000) { 
                setShowPasswordResetDialog(true);
            } else {
                toast({ title: 'Login Successful!', description: `Welcome back, ${creatorRecord.name}!` });
                router.push(`/creator/${user.uid}`);
            }

        } catch (error: unknown) {
            console.error("[CreatorLoginPage] Login error:", error);
            await signOut(clientAuth).catch(() => {});
            
            let description = 'An unknown error occurred. Please try again.';
            if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'auth/invalid-credential') {
                description = 'Incorrect password. Please try again.';
            } else if (typeof error === 'object' && error && 'message' in error) {
                description = (error as { message?: string }).message || description;
            }

            toast({ title: 'Login Failed', description, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            toast({ title: 'Password Reset Failed', description: 'New passwords do not match.', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: 'Password Too Short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
            return;
        }

        const user = clientAuth.currentUser;
        if (user) {
            try {
                await updatePassword(user, newPassword);
                toast({ title: 'Password Reset Successful', description: 'Your password has been updated. Redirecting...' });
                setShowPasswordResetDialog(false);
                router.push(`/creator/${user.uid}`);
            } catch (error) {
                console.error("[CreatorLoginPage] Password reset error:", error);
                toast({ title: 'Password Reset Failed', description: 'Could not update password. Please try again.', variant: 'destructive' });
            }
        }
    };
  
  return (
    <>
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <div className="p-3 bg-primary rounded-full">
                    <User className="w-8 h-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-3xl font-bold">Creator Portal</CardTitle>
          <CardDescription>Welcome back! Sign in to view your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative flex items-center">
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="pr-10"/>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login as Creator'}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Not a creator?{' '}
            <Link href="/" className="underline">
              Go to main page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>

     <AlertDialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
        <AlertDialogContent>
         <AlertDialogHeader>
         <AlertDialogTitle id="reset-password-title">Welcome! Let&apos;s secure your account.</AlertDialogTitle>
         <AlertDialogDescription id="reset-password-desc">
             This is your first time logging in. For your security, please set a new, permanent password.
         </AlertDialogDescription>
         </AlertDialogHeader>
         <div className="space-y-4 py-4">
             <div className="space-y-2">
                 <Label htmlFor="new-password">New Password</Label>
                  <div className="relative flex items-center">
                     <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter your new password" className="pr-10" />
                     <Button type="button" variant="ghost" size="icon" className="absolute right-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowNewPassword(!showNewPassword)}>
                         {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </Button>
                 </div>
             </div>
             <div className="space-y-2">
                 <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <div className="relative flex items-center">
                     <Input id="confirm-new-password" type={showConfirmNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirm your new password" className="pr-10" />
                     <Button type="button" variant="ghost" size="icon" className="absolute right-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                         {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </Button>
                 </div>
             </div>
         </div>
         <AlertDialogFooter>
            <Button onClick={handlePasswordReset}>Set New Password</Button>
         </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

export async function getAdminByEmail(email: string) {
  const q = query(collection(db, "admins"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}
