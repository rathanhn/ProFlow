
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { deleteClient } from '@/lib/firebase-service';
import { Client } from '@/lib/types';
import { Copy, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClientActions({ client, action }: { client: Client, action: 'copy' | 'delete' }) {
    const { toast } = useToast();
    const router = useRouter();

    const copyToClipboard = (id: string) => {
        const url = `${window.location.origin}/client/${id}/auth`;
        navigator.clipboard.writeText(url);
        toast({
            title: "Link Copied!",
            description: "The client's dashboard link has been copied to your clipboard.",
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this client? This action cannot be undone and will remove all associated tasks and data.')) {
            try {
                await deleteClient(id);
                toast({
                    title: "Client Deleted",
                    description: "The client has been successfully deleted.",
                    variant: 'destructive'
                });
                router.refresh(); // Refresh the page to update the list
            } catch (error) {
                toast({
                    title: "Error Deleting Client",
                    description: "There was a problem deleting the client.",
                    variant: 'destructive'
                });
            }
        }
    };

    if (action === 'copy') {
        return (
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(client.id)}>
                    <Copy className="mr-2 h-3 w-3" />
                    Copy Link
                </Button>
            </div>
        );
    }

    if (action === 'delete') {
        return (
            <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onClick={() => handleDelete(client.id)}
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
            </DropdownMenuItem>
        );
    }
    
    return null;
}
