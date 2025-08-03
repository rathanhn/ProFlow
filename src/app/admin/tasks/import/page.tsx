'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addTask, getTasks, getClients } from '@/lib/firebase-service';
import { Task, WorkStatus, PaymentStatus, Client } from '@/lib/types';
import { Upload, FileText, Plus, Download, Copy, CloudUpload, FileSpreadsheet } from 'lucide-react';
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
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [jsonData, setJsonData] = useState('');
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [previewTasks, setPreviewTasks] = useState<TaskImportData[]>([]);
  const [activeTab, setActiveTab] = useState<'file' | 'json' | 'csv'>('file');
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientData = await getClients();
        setClients(clientData);
      } catch (error) {
        console.error('Failed to load clients:', error);
        toast({
          title: 'Error',
          description: 'Failed to load clients',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, [toast]);

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

  // File handling functions
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.name.endsWith('.csv')) {
        setCsvData(content);
        setActiveTab('csv');
      } else if (file.name.endsWith('.json')) {
        setJsonData(content);
        setActiveTab('json');
      } else {
        // Try to parse as CSV by default
        setCsvData(content);
        setActiveTab('csv');
      }
      toast({
        title: 'File Loaded',
        description: `${file.name} has been loaded successfully`,
      });
    };
    reader.readAsText(file);
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Export functions
  const exportSampleCSV = () => {
    const csvContent = `Project Name,Pages,Rate,Status,Notes,Start Date,Due Date
Website Redesign,8,150,In Progress,Modern responsive design,2024-01-15,2024-02-15
Logo Design,3,200,Pending,Brand identity project,2024-01-20,2024-02-05
Mobile App UI,12,120,Completed,iOS and Android interface,2024-01-01,2024-01-25`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_tasks.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Sample Downloaded',
      description: 'Sample CSV file has been downloaded',
    });
  };

  const exportSampleJSON = () => {
    const jsonContent = generateSampleJson();
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_tasks.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Sample Downloaded',
      description: 'Sample JSON file has been downloaded',
    });
  };

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
    if (!selectedClientId) {
      toast({
        title: 'Client Required',
        description: 'Please select a client',
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

    const selectedClient = clients.find(c => c.id === selectedClientId);
    if (!selectedClient) {
      toast({
        title: 'Client Not Found',
        description: 'Selected client not found',
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
          clientName: selectedClient.name,
          clientId: selectedClientId,
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
        description: `${previewTasks.length} tasks imported for ${selectedClient.name}`,
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
            Bulk import tasks from CSV, JSON files or Notion exports
          </p>
        </div>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="clientSelect">Choose Client</Label>
              {isLoadingClients ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Loading clients...</span>
                </div>
              ) : (
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {clients.length === 0 && !isLoadingClients && (
                <p className="text-sm text-muted-foreground">
                  No clients found. Please add clients first.
                </p>
              )}
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
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeTab === 'file' ? 'default' : 'outline'}
                onClick={() => setActiveTab('file')}
                size="sm"
              >
                <CloudUpload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <Button
                variant={activeTab === 'csv' ? 'default' : 'outline'}
                onClick={() => setActiveTab('csv')}
                size="sm"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                CSV Text
              </Button>
              <Button
                variant={activeTab === 'json' ? 'default' : 'outline'}
                onClick={() => setActiveTab('json')}
                size="sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                JSON Text
              </Button>
            </div>

            {/* File Upload */}
            {activeTab === 'file' && (
              <div>
                <Label>Upload CSV or JSON File</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <CloudUpload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports CSV and JSON files
                    </p>
                    <div className="pt-4">
                      <input
                        type="file"
                        accept=".csv,.json,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handlePreview} variant="outline">
                Preview Tasks
              </Button>

              {/* Sample Data Buttons */}
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

              {/* Export Buttons */}
              <Button
                onClick={exportSampleCSV}
                variant="ghost"
                size="sm"
              >
                <Download className="mr-1 h-3 w-3" />
                Download CSV Sample
              </Button>
              <Button
                onClick={exportSampleJSON}
                variant="ghost"
                size="sm"
              >
                <Download className="mr-1 h-3 w-3" />
                Download JSON Sample
              </Button>
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
            <CardTitle>Import Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📁 File Upload</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Drag & drop CSV or JSON files directly</li>
                <li>Supports .csv, .json, and .txt files</li>
                <li>Automatically detects file format</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">📋 Required Fields</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Project Name:</strong> Name of the project/task</li>
                <li><strong>Pages:</strong> Number of pages (numeric)</li>
                <li><strong>Rate:</strong> Rate per page (numeric)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">⚙️ Optional Fields</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Work Status:</strong> "Pending", "In Progress", "Completed"</li>
                <li><strong>Notes:</strong> Additional project details</li>
                <li><strong>Start/Accepted Date:</strong> YYYY-MM-DD format</li>
                <li><strong>Due/Submission Date:</strong> YYYY-MM-DD format</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">🎯 Notion Export</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Export your Notion database as CSV</li>
                <li>Common column names are automatically mapped</li>
                <li>Use "Project Name", "Pages", "Rate" for best results</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
