
'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateAssignee } from '@/lib/firebase-service';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { Assignee } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

const editAssigneeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email.").optional().or(z.literal('')),
    mobile: z.string().optional(),
    description: z.string().optional(),
    avatar: z.string().url().optional(),
});

interface EditTeamMemberFormProps {
    assignee: Assignee;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditTeamMemberForm({ assignee, isOpen, onClose }: EditTeamMemberFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [description, setDescription] = useState('');
    const [avatar, setAvatar] = useState('https://placehold.co/128x128.png');
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (assignee) {
            setName(assignee.name || '');
            setEmail(assignee.email || '');
            setMobile(assignee.mobile || '');
            setDescription(assignee.description || '');
            setAvatar(assignee.avatar || 'https://placehold.co/128x128.png');
        }
    }, [assignee]);

    const handleUpdateMember = async () => {
        try {
            const validation = editAssigneeSchema.safeParse({ name, email, mobile, avatar, description });
            if (!validation.success) {
                toast({ title: "Invalid Input", description: validation.error.errors[0].message, variant: 'destructive' });
                return;
            }

            await updateAssignee(assignee.id, { name, email, mobile, avatar, description });
            toast({ title: "Team Member Updated", description: `${name}'s details have been updated.` });
            onClose();
            router.refresh();
        } catch (error) {
            console.error("Failed to update team member:", error);
            toast({ title: 'Error', description: 'Failed to update team member.', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                    <DialogDescription>
                        Update the details for this team member.
                    </DialogDescription>
                </DialogHeader>
                 <div className="grid gap-4 py-4">
                     <div className="flex flex-col items-center">
                        <Label>Profile Picture</Label>
                        <ImageUploader 
                            value={avatar}
                            onChange={setAvatar}
                            fallbackText={name?.charAt(0) || 'T'}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-member-name" className="text-right">Name</Label>
                        <Input id="edit-member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-member-email" className="text-right">Email</Label>
                        <Input id="edit-member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@example.com" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-member-mobile" className="text-right">Mobile</Label>
                        <Input id="edit-member-mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+1234567890" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="edit-member-desc" className="text-right pt-2">Description</Label>
                        <Textarea id="edit-member-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Team member's role or bio..." className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleUpdateMember}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
