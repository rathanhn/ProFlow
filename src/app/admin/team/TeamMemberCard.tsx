
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';
import { Assignee } from '@/lib/types';
import TeamActions from './TeamActions';
import { Eye, Mail, Phone } from 'lucide-react';

interface TeamMemberCardProps {
    assignee: Assignee;
}

export default function TeamMemberCard({ assignee }: TeamMemberCardProps) {
    const { isOpen, imageData, openViewer, closeViewer } = useProfileImageViewer();

    return (
        <>
            <Card key={assignee.id} className="relative">
            <div className="absolute top-2 right-2">
                <TeamActions assignee={assignee} />
            </div>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <Avatar
                        className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all duration-200"
                        onClick={() => {
                            if (assignee.avatar) {
                                openViewer(assignee.avatar, assignee.name, assignee.email);
                            }
                        }}
                    >
                        <AvatarImage src={assignee.avatar} alt="Avatar" />
                        <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{assignee.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {assignee.email || "N/A"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {assignee.mobile || "N/A"}</p>
                    </div>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full mt-4">
                    <Link href={`/profile/${assignee.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                    </Link>
                </Button>
            </CardContent>
            </Card>

            {/* Profile Image Viewer */}
            <ProfileImageViewer
                isOpen={isOpen}
                onClose={closeViewer}
                imageUrl={imageData.imageUrl}
                userName={imageData.userName}
                userEmail={imageData.userEmail}
            />
        </>
    );
}
