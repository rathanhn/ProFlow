
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    PlusCircle,
    Mail,
} from 'lucide-react';
import { getClients } from '@/lib/firebase-service';
import { Client } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import ClientActions from './ClientActions';


export default async function AdminClientsPage() {
    const rawClients = await getClients();
    // Ensure clients are serializable
    const clients = JSON.parse(JSON.stringify(rawClients));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
                <p className="text-muted-foreground">Add, edit, or remove clients.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/admin/clients/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Client
                    </Link>
                </Button>
            </div>
        </div>
       
        <Card className="md:hidden">
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>Manage your clients and their dashboard access.</CardDescription>
          </CardHeader>
        </Card>
        <div className="grid gap-4 md:hidden">
            {clients.map((client: Client) => (
                <Card key={client.id} className="relative">
                <div className="absolute top-2 right-2">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                        <Link href={`/admin/clients/${client.id}/edit`}>Edit Client</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ClientActions client={client} action="delete" />
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={client.avatar} alt="Avatar" />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">{client.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ClientActions client={client} action="copy" />
                </CardContent>
                </Card>
            ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block w-full">
            <Card>
                <CardHeader>
                    <CardTitle>All Clients</CardTitle>
                    <CardDescription>Manage your clients and their dashboard access.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Sharable Link</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client: Client) => (
                        <TableRow key={client.id}>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                <AvatarImage src={client.avatar} alt="Avatar" />
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-medium whitespace-nowrap">{client.name}</p>
                            </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{client.email}</TableCell>
                            <TableCell>
                            <ClientActions client={client} action="copy" />
                            </TableCell>
                            <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/clients/${client.id}/edit`}>Edit Client</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <ClientActions client={client} action="delete" />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
