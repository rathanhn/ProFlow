
'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';


export default function AdminSettingsPage() {

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your admin dashboard settings.</p>
                </div>

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

            </div>
        </DashboardLayout>
    );
}
