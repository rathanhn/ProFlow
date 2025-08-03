'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addTask, getTasks } from '@/lib/firebase-service';
import { Task, WorkStatus, PaymentStatus } from '@/lib/types';
import { Upload, FileText, Plus, Download, Copy } from 'lucide-react';
import { convertNotionToProFlow, csvToJson, generateSampleJson } from '@/lib/notion-converter';

interface TaskImportData {
  projectName: string;
  pages: number;
  rate: number;
  workStatus: WorkStatus;
  notes?: string;
  acceptedDate?: string;
  submissionDate?: string;
}

export default function TaskImportPage() {
  const [clientId] = useState('lx3NLv6g45YwM1DI4IFGUMaIpeg2'); // The client ID you provided
  const [clientName, setClientName] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewTasks, setPreviewTasks] = useState<TaskImportData[]>([]);
  const [activeTab, setActiveTab] = useState<'json' | 'csv'>('json');
  const { toast } = useToast();
  const router = useRouter();

  // Sample data format for reference
  const sampleData = `[
  {
    "projectName": "Website Design",
    "pages": 5,
    "rate": 100,
    "workStatus": "Pending",
    "notes": "Modern responsive design needed",
    "acceptedDate": "2024-01-15",
    "submissionDate": "2024-01-30"
  },
  {
    "projectName": "Logo Creation",
    "pages": 2,
    "rate": 150,
    "workStatus": "In Progress",
    "notes": "Brand identity project"
  }
]`;

  const handlePreview = () => {
    try {
      let parsed;

      if (activeTab === 'csv') {
        if (!csvData.trim()) {
          throw new Error('Please enter CSV data');
        }
        const csvJson = csvToJson(csvData);
        parsed = convertNotionToProFlow(csvJson);
      } else {
        if (!jsonData.trim()) {
          throw new Error('Please enter JSON data');
        }
        parsed = JSON.parse(jsonData);
        if (!Array.isArray(parsed)) {
          throw new Error('Data must be an array of tasks');
        }
      }

      const validatedTasks = parsed.map((task, index) => {
        if (!task.projectName || !task.pages || !task.rate) {
          throw new Error(`Task ${index + 1}: Missing required fields (projectName, pages, rate)`);
        }

        return {
          projectName: task.projectName,
          pages: Number(task.pages),
          rate: Number(task.rate),
          workStatus: (task.workStatus || 'Pending') as WorkStatus,
          notes: task.notes || '',
          acceptedDate: task.acceptedDate || new Date().toISOString().split('T')[0],
          submissionDate: task.submissionDate || new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
        };
      });

      setPreviewTasks(validatedTasks);
      toast({
        title: 'Preview Generated',
        description: `${validatedTasks.length} tasks ready for import`,
      });
    } catch (error) {
      toast({
        title: 'Invalid Data',
        description: error instanceof Error ? error.message : 'Please check your data format',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!clientName.trim()) {
      toast({
        title: 'Client Name Required',
        description: 'Please enter the client name',
        variant: 'destructive',
      });
      return;
    }

    if (previewTasks.length === 0) {
      toast({
        title: 'No Tasks to Import',
        description: 'Please preview tasks first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const existingTasks = await getTasks();
      let slNo = existingTasks.length + 1;

      for (const taskData of previewTasks) {
        const newTask: Omit<Task, 'id'> = {
          slNo: slNo++,
          clientName: clientName.trim(),
          clientId: clientId,
          acceptedDate: new Date(taskData.acceptedDate!).toISOString(),
          projectName: taskData.projectName,
          pages: taskData.pages,
          rate: taskData.rate,
          workStatus: taskData.workStatus,
          paymentStatus: 'Unpaid' as PaymentStatus,
          submissionDate: new Date(taskData.submissionDate!).toISOString(),
          notes: taskData.notes,
          total: taskData.pages * taskData.rate,
          amountPaid: 0,
          assigneeId: '',
          assigneeName: '',
          projectFileLink: '',
          outputFileLink: '',
        };

        await addTask(newTask);
      }

      toast({
        title: 'Import Successful!',
        description: `${previewTasks.length} tasks imported successfully`,
      });

      router.push('/admin/tasks');
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Tasks</h1>
          <p className="text-muted-foreground">
            Import tasks for client ID: <code className="bg-muted px-2 py-1 rounded">{clientId}</code>
          </p>
        </div>

        {/* Client Name Input */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Task Data Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tab Buttons */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'json' ? 'default' : 'outline'}
                onClick={() => setActiveTab('json')}
                size="sm"
              >
                JSON Format
              </Button>
              <Button
                variant={activeTab === 'csv' ? 'default' : 'outline'}
                onClick={() => setActiveTab('csv')}
                size="sm"
              >
                CSV from Notion
              </Button>
            </div>

            {/* JSON Input */}
            {activeTab === 'json' && (
              <div>
                <Label htmlFor="jsonData">Paste your task data in JSON format:</Label>
                <Textarea
                  id="jsonData"
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder={sampleData}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            )}

            {/* CSV Input */}
            {activeTab === 'csv' && (
              <div>
                <Label htmlFor="csvData">Paste CSV data from Notion (export your database as CSV):</Label>
                <Textarea
                  id="csvData"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Project Name,Pages,Rate,Status,Notes,Start Date,Due Date
Website Redesign,8,150,In Progress,Modern responsive design,2024-01-15,2024-02-15
Logo Design,3,200,Pending,Brand identity project,2024-01-20,2024-02-05"
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Export your Notion database as CSV and paste the content here. The converter will automatically map common column names.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handlePreview} variant="outline">
                Preview Tasks
              </Button>
              {activeTab === 'json' && (
                <Button
                  onClick={() => setJsonData(sampleData)}
                  variant="ghost"
                  size="sm"
                >
                  Load Sample JSON
                </Button>
              )}
              {activeTab === 'csv' && (
                <Button
                  onClick={() => setCsvData(`Project Name,Pages,Rate,Status,Notes,Start Date,Due Date
Website Redesign,8,150,In Progress,Modern responsive design,2024-01-15,2024-02-15
Logo Design,3,200,Pending,Brand identity project,2024-01-20,2024-02-05
Mobile App UI,12,120,Completed,iOS and Android interface,2024-01-01,2024-01-25`)}
                  variant="ghost"
                  size="sm"
                >
                  Load Sample CSV
                </Button>
              )}
              <Button
                onClick={() => {
                  const sample = generateSampleJson();
                  navigator.clipboard.writeText(sample);
                  toast({ title: 'Copied!', description: 'Sample JSON copied to clipboard' });
                }}
                variant="ghost"
                size="sm"
              >
                <Copy className="mr-1 h-3 w-3" />
                Copy Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {previewTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview ({previewTasks.length} tasks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {previewTasks.map((task, index) => (
                  <div key={index} className="border rounded p-3 text-sm">
                    <div className="font-medium">{task.projectName}</div>
                    <div className="text-muted-foreground">
                      {task.pages} pages × ₹{task.rate} = ₹{task.pages * task.rate} | Status: {task.workStatus}
                    </div>
                    {task.notes && <div className="text-xs text-muted-foreground mt-1">{task.notes}</div>}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button 
                  onClick={handleImport} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>Importing...</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import {previewTasks.length} Tasks
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Required fields:</strong> projectName, pages, rate</p>
            <p><strong>Optional fields:</strong> workStatus, notes, acceptedDate, submissionDate</p>
            <p><strong>Work Status options:</strong> "Pending", "In Progress", "Completed"</p>
            <p><strong>Date format:</strong> YYYY-MM-DD (e.g., 2024-01-15)</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
