
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, Eye, EyeOff, Loader2, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { getAdminByEmail } from '@/lib/firebase-service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const adminRecord = await getAdminByEmail(email);
      if (!adminRecord) {
        await signOut(auth);
        toast({
          title: 'Access Denied',
          description: 'You do not have administrative permissions.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Login Successful',
        description: 'Redirecting to Admin Dashboard...',
      });
      router.push('/admin');
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 overflow-x-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 -m-20 h-[300px] sm:h-[500px] w-[300px] sm:w-[500px] rounded-full bg-blue-600/10 blur-[60px] sm:blur-[100px]" />
        <div className="absolute bottom-0 left-0 -m-20 h-[300px] sm:h-[500px] w-[300px] sm:w-[500px] rounded-full bg-indigo-600/10 blur-[60px] sm:blur-[100px]" />
      </div>

      <Card className="w-full max-w-md mx-auto relative overflow-hidden glass-card border-white/20 shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem]">
        <div className="absolute top-0 inset-x-0 h-1.5 sm:h-2 bg-gradient-to-r from-blue-700 to-indigo-700" />

        <CardHeader className="text-center pt-8 sm:pt-10 pb-4 sm:pb-6 px-6 sm:px-8">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-700 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 mb-4 sm:mb-6 animate-float">
            <Rocket className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            Admin Login
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm font-medium pt-2 max-w-[280px] mx-auto text-muted-foreground/80">
            Sign in to manage projects and dashboard settings.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-6 sm:px-8 pb-8 sm:pb-10">
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Admin Email</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 sm:h-12 pl-11 border-white/20 focus:border-blue-600 bg-white/50 dark:bg-slate-900/50 rounded-xl transition-all shadow-sm font-bold text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 ml-1">Password</Label>
              <div className="relative flex items-center group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors">
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="h-11 sm:h-12 pl-11 pr-12 border-white/20 focus:border-blue-600 bg-white/50 dark:bg-slate-900/50 rounded-xl transition-all shadow-sm font-bold text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 h-9 w-9 sm:h-10 sm:w-10 hover:bg-transparent text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <Button
              onClick={handleLogin}
              className="w-full h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login as Admin'
              )}
            </Button>

            <Link href="/" className="inline-flex items-center justify-center gap-2 text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 hover:text-indigo-600 transition-colors py-2">
              <ArrowRight className="h-3 w-3" /> Back to Home
            </Link>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-border/60">
            <p className="text-[9px] sm:text-[10px] text-center text-muted-foreground/40 font-medium italic">
              Administrative Access Only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
