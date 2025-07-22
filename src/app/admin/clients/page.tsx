
'use client';

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
} from '@/components/ui/dropdown-menu';
import {
    Copy,
    MoreHorizontal,
    PlusCircle,
} from 'lucide-react';
import { clients } from '@/lib/data';
import { Client } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';


export default function AdminClientsPage() {
    const { toast } = useToast();

    const copyToClipboard = (id: string) => {
        const url = `${window.location.origin}/client/${id}/auth`;
        navigator.clipboard.writeText(url);
        toast({
            title: "Link Copied!",
            description: "The client's dashboard link has been copied to your clipboard.",
        });
    };
    
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
                <p className="text-muted-foreground">Add, edit, or remove clients.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href="/admin/clients/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Client
                    </Link>
                </Button>
            </div>
        </div>
       
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
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Sharable Link</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client: Client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                           <AvatarImage src={client.avatar} data-ai-hint={client.dataAiHint} alt="Avatar" />
                           <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{client.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{client.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(client.id)}>
                            <Copy className="mr-2 h-3 w-3" />
                            Copy Link
                        </Button>
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
                            <Link href={`/admin/clients/${client.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
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
    </DashboardLayout>
  );
}
