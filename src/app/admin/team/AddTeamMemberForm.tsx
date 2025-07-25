
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
import { Eye, EyeOff, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAssignee } from '@/lib/firebase-service';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { Textarea } from '@/components/ui/textarea';

const newAssigneeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    mobile: z.string().optional(),
    description: z.string().optional(),
    avatar: z.string().url().optional(),
});

export default function AddTeamMemberForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mobile, setMobile] = useState('');
    const [description, setDescription] = useState('');
    const [avatar, setAvatar] = useState('https://placehold.co/128x128.png');
    const { toast } = useToast();
    const router = useRouter();

    const handleAddMember = async () => {
        try {
            const validation = newAssigneeSchema.safeParse({ name, email, password, mobile, avatar, description });
            if (!validation.success) {
                toast({ title: "Invalid Input", description: validation.error.errors[0].message, variant: 'destructive' });
                return;
            }

            await addAssignee({ name, email, password, mobile, avatar, description });
            toast({ title: "Creator Added", description: `${name} has been added.` });
            setName('');
            setEmail('');
            setPassword('');
            setMobile('');
            setDescription('');
            setAvatar('https://placehold.co/128x128.png');
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to add creator:", error);
            toast({ title: 'Error', description: 'Failed to add creator. They may already exist.', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Creator
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Creator</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new creator. An email and password are required for them to log in.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="flex flex-col items-center">
                        <Label>Profile Picture</Label>
                        <ImageUploader 
                            value={avatar}
                            onChange={setAvatar}
                            fallbackText={name?.charAt(0) || 'C'}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-member-name" className="text-right">Name</Label>
                        <Input id="new-member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-member-email" className="text-right">Email</Label>
                        <Input id="new-member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@example.com" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-member-password" className="text-right">Password</Label>
                        <div className="relative col-span-3">
                            <Input
                                id="new-member-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Set initial password"
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-member-mobile" className="text-right">Mobile</Label>
                        <Input id="new-member-mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+1234567890" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="new-member-desc" className="text-right pt-2">Description</Label>
                        <Textarea id="new-member-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Creator's role or bio..." className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleAddMember}>Add Creator</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
