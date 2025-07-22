
'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAssignee } from '@/lib/firebase-service';
import { useRouter } from 'next/navigation';

const newAssigneeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email.").optional().or(z.literal('')),
});

export default function AddTeamMemberForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    const handleAddMember = async () => {
        try {
            const validation = newAssigneeSchema.safeParse({ name, email });
            if (!validation.success) {
                toast({ title: "Invalid Input", description: validation.error.errors[0].message, variant: 'destructive' });
                return;
            }

            await addAssignee({ name, email });
            toast({ title: "Team Member Added", description: `${name} has been added.` });
            setName('');
            setEmail('');
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to add team member:", error);
            toast({ title: 'Error', description: 'Failed to add team member.', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Team Member</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new team member.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-member-name">Name</Label>
                        <Input id="new-member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-member-email">Email (Optional)</Label>
                        <Input id="new-member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@example.com" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleAddMember}>Add Member</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
