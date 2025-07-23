
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
    PlusCircle,
    Trash2,
    User
} from 'lucide-react';
import { getAssignees } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import TeamActions from './TeamActions';
import AddTeamMemberForm from './AddTeamMemberForm';


export default async function AdminTeamPage() {
    const assignees = await getAssignees();
    
    // Ensure assignees are serializable
    const serializableAssignees = JSON.parse(JSON.stringify(assignees)) as Assignee[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                <p className="text-muted-foreground">Add, edit, or remove team members.</p>
            </div>
            <div className="w-full sm:w-auto">
              <AddTeamMemberForm />
            </div>
        </div>
       
        <Card>
          <CardHeader>
            <CardTitle>All Team Members</CardTitle>
            <CardDescription>Manage your team members and their assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serializableAssignees.map((assignee: Assignee) => (
                    <TableRow key={assignee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://placehold.co/32x32.png`} data-ai-hint="user avatar" alt="Avatar" />
                            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium whitespace-nowrap">{assignee.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{assignee.email || "N/A"}</TableCell>
                      <TableCell>
                          <TeamActions assignee={assignee} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
