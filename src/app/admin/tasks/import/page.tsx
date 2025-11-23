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
import { Upload, FileText, Plus, Download, Copy, CloudUpload, FileSpreadsheet, Edit3, Check, X, Eye, EyeOff } from 'lucide-react';
import { convertNotionToProFlow, csvToJson, generateSampleJson } from '@/lib/notion-converter';

interface TaskImportData {
  projectName: string;
  pages: number;
  rate: number;
  workStatus: WorkStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  acceptedDate?: string;
  submissionDate?: string;
  isValid?: boolean;
  originalIndex?: number;
  rawData?: any;
}

interface EditableTask extends TaskImportData {
  selected: boolean;
  id: string;
}

export default function TaskImportPage() {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [jsonData, setJsonData] = useState('');
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [previewTasks, setPreviewTasks] = useState<TaskImportData[]>([]);
  const [editableTasks, setEditableTasks] = useState<EditableTask[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'file' | 'json' | 'csv'>('file');
  const [isDragOver, setIsDragOver] = useState(false);
  const [defaultRate, setDefaultRate] = useState(100);
  const [defaultPaymentStatus, setDefaultPaymentStatus] = useState<PaymentStatus>('Unpaid');
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

  // Update default rate when client is selected
  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const selectedClient = clients.find(c => c.id === selectedClientId);
      if (selectedClient?.defaultRate) {
        setDefaultRate(selectedClient.defaultRate);
      }
    }
  }, [selectedClientId, clients]);

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
        console.log('Raw CSV data:', csvData);
        const csvJson = csvToJson(csvData);
        console.log('Parsed CSV to JSON:', csvJson);
        parsed = convertNotionToProFlow(csvJson, defaultRate, defaultPaymentStatus);
        console.log('Converted to ProFlow format:', parsed);
      } else if (activeTab === 'file') {
        // File data should already be in csvData or jsonData
        if (csvData.trim()) {
          console.log('Processing file as CSV');
          const csvJson = csvToJson(csvData);
          parsed = convertNotionToProFlow(csvJson, defaultRate, defaultPaymentStatus);
        } else if (jsonData.trim()) {
          console.log('Processing file as JSON');
          parsed = JSON.parse(jsonData);
          if (!Array.isArray(parsed)) {
            throw new Error('Data must be an array of tasks');
          }
        } else {
          throw new Error('Please upload a file first');
        }
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
          paymentStatus: (task.paymentStatus || defaultPaymentStatus) as PaymentStatus,
          notes: task.notes || '',
          acceptedDate: task.acceptedDate || new Date().toISOString().split('T')[0],
          submissionDate: task.submissionDate || new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
        };
      });

      setPreviewTasks(validatedTasks);

      // Create editable tasks with selection state
      const editableTasks: EditableTask[] = validatedTasks.map((task, index) => ({
        ...task,
        id: `task-${index}`,
        selected: task.isValid !== false, // Auto-select valid tasks
      }));

      setEditableTasks(editableTasks);
      setShowEditor(true);

      const validCount = editableTasks.filter(t => t.selected).length;
      const totalCount = editableTasks.length;

      toast({
        title: 'Preview Generated',
        description: `${totalCount} rows found, ${validCount} auto-selected as valid tasks`,
      });
    } catch (error) {
      toast({
        title: 'Invalid Data',
        description: error instanceof Error ? error.message : 'Please check your data format',
        variant: 'destructive',
      });
    }
  };

  // Task editor functions
  const toggleTaskSelection = (taskId: string) => {
    setEditableTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, selected: !task.selected } : task
      )
    );
  };

  const selectAllTasks = () => {
    setEditableTasks(prev => prev.map(task => ({ ...task, selected: true })));
  };

  const deselectAllTasks = () => {
    setEditableTasks(prev => prev.map(task => ({ ...task, selected: false })));
  };

  const updateTask = (taskId: string, updates: Partial<EditableTask>) => {
    setEditableTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const removeTask = (taskId: string) => {
    setEditableTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getSelectedTasks = () => {
    return editableTasks.filter(task => task.selected);
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

    const selectedTasks = getSelectedTasks();
    if (selectedTasks.length === 0) {
      toast({
        title: 'No Tasks Selected',
        description: 'Please select at least one task to import',
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

      for (const taskData of selectedTasks) {
        const newTask: Omit<Task, 'id'> = {
          slNo: slNo++,
          clientName: selectedClient.name,
          clientId: selectedClientId,
          acceptedDate: new Date(taskData.acceptedDate!).toISOString(),
          projectName: taskData.projectName,
          pages: taskData.pages,
          rate: taskData.rate,
          workStatus: taskData.workStatus,
          paymentStatus: taskData.paymentStatus,
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
        description: `${selectedTasks.length} tasks imported for ${selectedClient.name}`,
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

        {/* Client Selection & Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Import Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultRate">Default Rate per Page (₹)</Label>
                <Input
                  id="defaultRate"
                  type="number"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(parseInt(e.target.value) || 100)}
                  min="1"
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  Used when rate is missing or invalid
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPaymentStatus">Default Payment Status</Label>
                <Select value={defaultPaymentStatus} onValueChange={setDefaultPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Used when payment status is not specified
                </p>
              </div>
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
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
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

        {/* Debug Information */}
        {(csvData || jsonData) && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>Active Tab:</strong> {activeTab}
              </div>
              <div>
                <strong>CSV Data Length:</strong> {csvData.length} characters
              </div>
              <div>
                <strong>JSON Data Length:</strong> {jsonData.length} characters
              </div>
              {csvData && (
                <div>
                  <strong>CSV Lines:</strong> {csvData.split('\n').length}
                  <details className="mt-2">
                    <summary className="cursor-pointer">Show first 3 lines</summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                      {csvData.split('\n').slice(0, 3).join('\n')}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Task Editor */}
        {showEditor && editableTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Review & Select Tasks ({editableTasks.filter(t => t.selected).length} of {editableTasks.length} selected)</span>
                <div className="flex gap-2">
                  <Button onClick={selectAllTasks} variant="outline" size="sm">
                    <Check className="mr-1 h-3 w-3" />
                    Select All
                  </Button>
                  <Button onClick={deselectAllTasks} variant="outline" size="sm">
                    <X className="mr-1 h-3 w-3" />
                    Deselect All
                  </Button>
                </div>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Review each row and select only the tasks you want to import. Invalid rows are automatically deselected.
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {editableTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 transition-all ${task.selected
                        ? 'border-primary bg-primary/5'
                        : task.isValid === false
                          ? 'border-destructive bg-destructive/5'
                          : 'border-muted'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center pt-1">
                        <input
                          type="checkbox"
                          checked={task.selected}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Input
                                value={task.projectName}
                                onChange={(e) => updateTask(task.id, { projectName: e.target.value })}
                                className="font-medium"
                                placeholder="Project name"
                              />
                              {task.isValid === false && (
                                <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                                  Invalid
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Row #{task.originalIndex! + 1}
                            </div>
                          </div>

                          <Button
                            onClick={() => removeTask(task.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Pages</Label>
                            <Input
                              type="number"
                              value={task.pages}
                              onChange={(e) => updateTask(task.id, { pages: parseInt(e.target.value) || 1 })}
                              min="1"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Rate</Label>
                            <Input
                              type="number"
                              value={task.rate}
                              onChange={(e) => updateTask(task.id, { rate: parseFloat(e.target.value) || defaultRate })}
                              min="1"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Work Status</Label>
                            <Select
                              value={task.workStatus}
                              onValueChange={(value: WorkStatus) => updateTask(task.id, { workStatus: value })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Payment Status</Label>
                            <Select
                              value={task.paymentStatus}
                              onValueChange={(value: PaymentStatus) => updateTask(task.id, { paymentStatus: value })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Total</Label>
                            <div className="h-8 px-3 py-1 bg-muted rounded text-sm flex items-center">
                              ₹{(task.pages * task.rate).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {task.notes && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Notes</Label>
                            <Input
                              value={task.notes}
                              onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                              placeholder="Task notes"
                              className="h-8"
                            />
                          </div>
                        )}

                        {task.rawData && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">Show raw data</summary>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(task.rawData, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">
                    {editableTasks.filter(t => t.selected).length} tasks selected •
                    Total value: ₹{editableTasks.filter(t => t.selected).reduce((sum, task) => sum + (task.pages * task.rate), 0).toLocaleString()}
                  </div>
                  <Button
                    onClick={() => setShowEditor(false)}
                    variant="outline"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Selected
                  </Button>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={isLoading || !selectedClientId || editableTasks.filter(t => t.selected).length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/30 mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import {editableTasks.filter(t => t.selected).length} Selected Tasks
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {!showEditor && previewTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview ({getSelectedTasks().length} selected tasks)</span>
                <Button
                  onClick={() => setShowEditor(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Selection
                </Button>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Total Value: ₹{getSelectedTasks().reduce((sum, task) => sum + (task.pages * task.rate), 0).toLocaleString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getSelectedTasks().map((task, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-base">{task.projectName}</div>
                        <div className="text-sm text-muted-foreground">Task #{index + 1}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{(task.pages * task.rate).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Pages</div>
                        <div className="font-medium">{task.pages}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Rate</div>
                        <div className="font-medium">₹{task.rate}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Work Status</div>
                        <div className="font-medium">{task.workStatus}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Payment</div>
                        <div className="font-medium">{task.paymentStatus}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Due Date</div>
                        <div className="font-medium">{new Date(task.submissionDate!).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {task.notes && (
                      <div className="pt-2 border-t">
                        <div className="text-muted-foreground text-xs">Notes</div>
                        <div className="text-sm">{task.notes}</div>
                      </div>
                    )}

                    <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Start: {new Date(task.acceptedDate!).toLocaleDateString()}</span>
                      <span>Duration: {Math.ceil((new Date(task.submissionDate!).getTime() - new Date(task.acceptedDate!).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="font-semibold text-lg">{getSelectedTasks().length}</div>
                    <div className="text-muted-foreground">Selected Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="font-semibold text-lg">{getSelectedTasks().reduce((sum, task) => sum + task.pages, 0)}</div>
                    <div className="text-muted-foreground">Total Pages</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="font-semibold text-lg">₹{getSelectedTasks().length > 0 ? Math.round(getSelectedTasks().reduce((sum, task) => sum + (task.pages * task.rate), 0) / getSelectedTasks().length).toLocaleString() : '0'}</div>
                    <div className="text-muted-foreground">Avg. Value</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded">
                    <div className="font-semibold text-lg">₹{getSelectedTasks().reduce((sum, task) => sum + (task.pages * task.rate), 0).toLocaleString()}</div>
                    <div className="text-muted-foreground">Total Value</div>
                  </div>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={isLoading || !selectedClientId}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/30 mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import {getSelectedTasks().length} Tasks for {clients.find(c => c.id === selectedClientId)?.name || 'Selected Client'}
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
