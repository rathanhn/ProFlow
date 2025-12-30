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
  Trash2,
  Users
} from 'lucide-react';
import Link from 'next/link';
import TeamActions from './TeamActions';

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
      <div className="grid gap-4 md:hidden">
        {assignees.map((assignee) => (
          <div key={assignee.id} className="relative group">
            <div className="p-4 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-white/10 shadow-lg">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="bg-blue-500 text-white font-black">{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm uppercase tracking-tight truncate">{assignee.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                    <Mail className="h-3 w-3" /> {assignee.email}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Creator</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-white/20 glass-card">
                      <DropdownMenuItem asChild className="rounded-xl font-bold text-xs uppercase cursor-pointer">
                        <Link href={`/profile/${assignee.id}`}>
                          <Eye className="mr-2.5 h-4 w-4 text-blue-500" /> View Node
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl font-bold text-xs uppercase cursor-pointer">
                        <Link href={`/admin/team/${assignee.id}/edit`}>
                          <Edit className="mr-2.5 h-4 w-4 text-indigo-500" /> Reconfigure
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(assignee)}
                        className="rounded-xl font-bold text-xs uppercase text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="mr-2.5 h-4 w-4" /> Purge Entry
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase">
                  <Phone className="h-3.5 w-3.5 text-indigo-500" /> {assignee.mobile || 'NO TELEMETRY'}
                </div>
                <TeamActions assignee={assignee} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block glass-card border-white/20 shadow-2xl overflow-hidden rounded-[2.5rem]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Administrative Directory
              </CardTitle>
              <CardDescription>Verified list of creative leads and tactical personnel.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-white/10">
                <TableHead className="pl-8 font-black text-[10px] uppercase tracking-widest">Lead Identity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Communication Channel</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Tactical Protocol</TableHead>
                <TableHead className="pr-8 text-right font-black text-[10px] uppercase tracking-widest">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignees.map((assignee) => (
                <TableRow key={assignee.id} className="group hover:bg-blue-500/[0.02] border-white/10 transition-colors">
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white/5 shadow-md group-hover:ring-blue-500/20 transition-all duration-300">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-800 font-bold">{assignee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{assignee.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black text-blue-500/60 uppercase">CREATIVE CORE</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-blue-500" /> {assignee.email}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase">
                        <Phone className="h-3.5 w-3.5 text-indigo-500" /> {assignee.mobile || 'NO TELEMETRY'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <TeamActions assignee={assignee} />
                    </div>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-500/10 transition-colors">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-white/20 glass-card">
                        <DropdownMenuItem asChild className="rounded-xl font-bold text-xs uppercase cursor-pointer">
                          <Link href={`/profile/${assignee.id}`}>
                            <Eye className="mr-2.5 h-4 w-4 text-blue-500" /> View Node
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl font-bold text-xs uppercase cursor-pointer">
                          <Link href={`/admin/team/${assignee.id}/edit`}>
                            <Edit className="mr-2.5 h-4 w-4 text-indigo-500" /> Reconfigure
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(assignee)}
                          className="rounded-xl font-bold text-xs uppercase text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="mr-2.5 h-4 w-4" /> Purge Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {assignees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-black text-[10px] uppercase tracking-widest italic">
                    NO PERSONNEL DETECTED IN SECTOR
                  </TableCell>
                </TableRow>
              )}
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
