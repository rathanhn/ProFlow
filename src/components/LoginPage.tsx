'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket } from 'lucide-react';
import { clients } from '@/lib/data';

export default function LoginPage() {
  const firstClientId = clients[0]?.id || '1';
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <div className="p-3 bg-primary rounded-full">
                    <Rocket className="w-8 h-8 text-primary-foreground" />
                </div>
            </div>
          <CardTitle className="text-3xl font-bold">ProFlow</CardTitle>
          <CardDescription>Welcome back! Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin">Login as Admin</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href={`/client/${firstClientId}`}>Login as Client</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
