

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="flex justify-center items-center mb-4">
                    <div className="p-4 bg-primary rounded-full">
                        <Rocket className="w-10 h-10 text-primary-foreground" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold">Welcome to ProFlow</CardTitle>
                <CardDescription>Your all-in-one platform for managing projects, clients, and creators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>Please select your login portal:</p>
                <div className="flex flex-col gap-4">
                    <Button asChild className="w-full">
                        <Link href="/admin/login">
                           <User className="mr-2 h-4 w-4" /> Admin Login
                        </Link>
                    </Button>
                     <Button asChild className="w-full" variant="secondary">
                        <Link href="/client-login">
                           <User className="mr-2 h-4 w-4" /> Client Login
                        </Link>
                    </Button>
                     <Button asChild className="w-full" variant="outline">
                        <Link href="/creator/login">
                           <User className="mr-2 h-4 w-4" /> Creator Login
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
