'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeletionDialog } from '@/components/ui/deletion-dialog';
import { ToastProvider } from '@/components/ui/toast-system';
import { useDeletion } from '@/hooks/use-deletion';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { Assignee } from '@/lib/types';
import { 
  Eye, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Edit, 
  Trash2 
} from 'lucide-react';
import Link from 'next/link';
import TeamActions from './TeamActions';
import TeamMemberCard from './TeamMemberCard';

interface TeamPageClientProps {
  initialAssignees: Assignee[];
}

function TeamPageClientContent({ initialAssignees }: TeamPageClientProps) {
  const [assignees, setAssignees] = useState<Assignee[]>(initialAssignees);
  const [deletionDialog, setDeletionDialog] = useState<{
    isOpen: boolean;
    creator: Assignee | null;
    deletionData: any;
  }>({
    isOpen: false,
    creator: null,
    deletionData: null,
  });

  const haptic = useHapticFeedback();
  const { deleteCreator, getCreatorDeletionData } = useDeletion();

  const handleDeleteClick = async (creator: Assignee) => {
    try {
      haptic.androidClick();
      const deletionData = await getCreatorDeletionData(creator.id);
      setDeletionDialog({
        isOpen: true,
        creator,
        deletionData,
      });
    } catch (error) {
      console.error('Failed to get deletion data:', error);
    }
  };

  const handleConfirmDelete = async (options: {
    id: string;
    confirmationText: string;
    reassignTo?: string;
  }) => {
    await deleteCreator(options);
    setDeletionDialog({ isOpen: false, creator: null, deletionData: null });
    
    // Remove the deleted creator from the list
    setAssignees(prev => prev.filter(assignee => assignee.id !== options.id));
  };

  const closeDeletionDialog = () => {
    setDeletionDialog({ isOpen: false, creator: null, deletionData: null });
  };

  return (
    <>
      {/* Mobile View */}
      <Card className="md:hidden">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team members and their roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignees.map((assignee) => (
            <div key={assignee.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{assignee.name}</p>
                  <p className="text-sm text-muted-foreground">{assignee.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/creator/${assignee.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/team/${assignee.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Creator
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(assignee)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Creator
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team members and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignees.map((assignee) => (
                <TableRow key={assignee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{assignee.name}</p>
                        <p className="text-sm text-muted-foreground">Creator</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{assignee.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{assignee.phone || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TeamActions assignee={assignee} action="copy" />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/creator/${assignee.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/team/${assignee.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Creator
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(assignee)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Creator
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deletion Dialog */}
      <DeletionDialog
        isOpen={deletionDialog.isOpen}
        onClose={closeDeletionDialog}
        type="creator"
        data={{
          id: deletionDialog.creator?.id || '',
          name: deletionDialog.creator?.name || '',
          email: deletionDialog.creator?.email,
          assignedTasksCount: deletionDialog.deletionData?.assignedTasksCount || 0,
        }}
        availableCreators={deletionDialog.deletionData?.availableCreators || []}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}

export default function TeamPageClient({ initialAssignees }: TeamPageClientProps) {
  return (
    <ToastProvider position="top-right">
      <TeamPageClientContent initialAssignees={initialAssignees} />
    </ToastProvider>
  );
}
