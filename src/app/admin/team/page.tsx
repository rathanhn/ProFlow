
import DashboardLayout from '@/components/DashboardLayout';
import { getAssignees } from '@/lib/firebase-service';
import { Assignee } from '@/lib/types';
import React from 'react';
import AddTeamMemberForm from './AddTeamMemberForm';
import TeamPageClient from './TeamPageClient';


export default async function AdminTeamPage() {
    const rawAssignees = await getAssignees();
    
    // Ensure assignees are serializable
    const assignees = JSON.parse(JSON.stringify(rawAssignees)) as Assignee[];

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

        <TeamPageClient initialAssignees={assignees} />
      </div>
    </DashboardLayout>
  );
}
