
import DashboardLayout from '@/components/DashboardLayout';
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
import { getAssignees } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import TeamActions from './TeamActions';
import AddTeamMemberForm from './AddTeamMemberForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye } from 'lucide-react';


export default async function AdminTeamPage() {
    const assignees = await getAssignees();
    
    // Ensure assignees are serializable
    const serializableAssignees = JSON.parse(JSON.stringify(assignees)) as Assignee[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Creator Management</h1>
                <p className="text-muted-foreground">Add, edit, or remove creators.</p>
            </div>
            <div className="w-full sm:w-auto">
              <AddTeamMemberForm />
            </div>
        </div>
       
        <Card>
          <CardHeader>
            <CardTitle>All Creators</CardTitle>
            <CardDescription>Manage your creators and their assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serializableAssignees.map((assignee: Assignee) => (
                    <TableRow key={assignee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={assignee.avatar} alt="Avatar" />
                            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="font-medium whitespace-nowrap">{assignee.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{assignee.email || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{assignee.mobile || "N/A"}</TableCell>
                      <TableCell>
                         <Button asChild variant="outline" size="sm">
                            <Link href={`/profile/${assignee.id}`}>
                               <Eye className="mr-2 h-4 w-4" />
                               View Profile
                            </Link>
                         </Button>
                      </TableCell>
                      <TableCell className="text-right">
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
