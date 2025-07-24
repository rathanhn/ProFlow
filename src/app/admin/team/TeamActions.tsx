
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteAssignee } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import { Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditTeamMemberForm from './EditTeamMemberForm';

export default function TeamActions({ assignee }: { assignee: Assignee }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
            try {
                await deleteAssignee(id);
                toast({
                    title: "Team Member Deleted",
                    description: "The team member has been successfully deleted.",
                    variant: 'destructive'
                });
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error Deleting Member",
                    description: "There was a problem deleting the team member.",
                    variant: 'destructive'
                });
            }
        }
    };

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(assignee.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                </Button>
            </div>
            {isEditDialogOpen && (
                <EditTeamMemberForm
                    assignee={assignee}
                    isOpen={isEditDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                />
            )}
        </>
    );
}
