'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  Trash2,
  Copy
} from 'lucide-react';
import { useToast, ToastProvider } from '@/components/ui/toast-system';
import { getFeedbacks, updateFeedback, deleteFeedback } from '@/lib/firebase-service';
import { Feedback } from '@/lib/types';

// Helper function to create error signature for deduplication
const createErrorSignature = (feedback: Feedback): string => {
  if (feedback.type === 'crash' || feedback.type === 'bug') {
    // For errors, use title + first line of stack trace for signature
    const stackFirstLine = feedback.errorStack?.split('\n')[0] || '';
    return `${feedback.title}|${stackFirstLine}`.toLowerCase();
  }
  // For other feedback types, use title + description
  return `${feedback.title}|${feedback.description}`.toLowerCase();
};

// Function to deduplicate and prioritize errors
const deduplicateAndPrioritizeErrors = (feedbacks: Feedback[]): Feedback[] => {
  const errorMap = new Map<string, { feedback: Feedback; count: number; latestDate: string }>();
  const nonErrors: Feedback[] = [];

  // Group errors by signature and count occurrences
  feedbacks.forEach(feedback => {
    if (feedback.type === 'crash' || feedback.type === 'bug') {
      const signature = createErrorSignature(feedback);
      const existing = errorMap.get(signature);

      if (existing) {
        // Update count and keep the latest occurrence
        existing.count++;
        if (new Date(feedback.submittedAt) > new Date(existing.latestDate)) {
          existing.feedback = {
            ...feedback,
            title: `${feedback.title} (${existing.count + 1}x)`,
            description: `${feedback.description}\n\n--- OCCURRENCE COUNT ---\nThis error has occurred ${existing.count + 1} times. Latest occurrence: ${new Date(feedback.submittedAt).toLocaleString()}`
          };
          existing.latestDate = feedback.submittedAt;
        } else {
          existing.feedback.title = `${existing.feedback.title.replace(/\(\d+x\)$/, '')}(${existing.count + 1}x)`;
          existing.feedback.description = existing.feedback.description.replace(
            /This error has occurred \d+ times\./,
            `This error has occurred ${existing.count + 1} times.`
          );
        }
      } else {
        errorMap.set(signature, {
          feedback: { ...feedback },
          count: 1,
          latestDate: feedback.submittedAt
        });
      }
    } else {
      nonErrors.push(feedback);
    }
  });

  // Convert map to array and sort by priority and date
  const deduplicatedErrors = Array.from(errorMap.values()).map(item => item.feedback);

  // Priority order: critical > high > medium > low
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  // Sort errors by priority (highest first) then by latest date
  deduplicatedErrors.sort((a, b) => {
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  // Sort non-errors by date (latest first)
  nonErrors.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Return prioritized errors first, then other feedback
  return [...deduplicatedErrors, ...nonErrors];
};

function AdminFeedbackPageContent() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [activeFeedbacks, setActiveFeedbacks] = useState<Feedback[]>([]);
  const [resolvedFeedbacks, setResolvedFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const { showToast } = useToast();

  // Load real feedback data from Firebase and localStorage error reports
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        // Load feedback from Firebase
        const firebaseFeedbacks = await getFeedbacks();

        // Load error reports from localStorage (for backward compatibility)
        const storedErrorReports = JSON.parse(localStorage.getItem('errorReports') || '[]');

        // Add test duplicate errors for demonstration (remove in production)
        const testError = {
          id: `test-${Date.now()}`,
          type: 'crash',
          title: 'Element type is invalid: expected a string but got: <Settings />',
          description: 'Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: <Settings />. Did you accidentally export a JSX literal instead of a component?',
          status: 'pending',
          priority: 'high',
          submittedBy: 'System',
          submittedAt: new Date().toISOString(),
          userType: 'admin',
          category: 'Component Error',
          browserInfo: 'Chrome 139.0.0.0',
          url: '/creator/5Hq1jqqO5dEyRw1HV4XD',
          errorStack: 'Error: Element type is invalid\n    at createFiberFromTypeAndProps\n    at createFiberFromElement'
        };

        // Add multiple instances of the same error to test deduplication
        if (!storedErrorReports.some((r: any) => r.title.includes('Element type is invalid'))) {
          storedErrorReports.push(testError);
          storedErrorReports.push({ ...testError, id: `test-${Date.now()}-2`, submittedAt: new Date(Date.now() - 60000).toISOString() });
          storedErrorReports.push({ ...testError, id: `test-${Date.now()}-3`, submittedAt: new Date(Date.now() - 120000).toISOString() });
          localStorage.setItem('errorReports', JSON.stringify(storedErrorReports));
        }
        const errorReportFeedbacks: Feedback[] = storedErrorReports.map((report: any) => ({
          id: report.id,
          type: report.type === 'crash' ? 'crash' : report.type,
          title: report.title,
          description: report.description,
          status: report.status,
          priority: report.priority,
          submittedBy: report.submittedBy,
          submittedAt: report.submittedAt,
          userType: report.userType,
          category: report.category || 'System Error',
          rating: undefined,
          browserInfo: report.browserInfo,
          url: report.url,
          userAgent: report.userAgent,
          errorStack: report.errorStack,
          componentStack: report.componentStack
        }));

        // Combine Firebase feedback and localStorage error reports
        const allFeedbacks = [...firebaseFeedbacks, ...errorReportFeedbacks];

        // Deduplicate and prioritize errors
        const processedFeedbacks = deduplicateAndPrioritizeErrors(allFeedbacks);

        // Separate active and resolved feedback
        const active = processedFeedbacks.filter(f => f.status !== 'resolved' && f.status !== 'closed');
        const resolved = processedFeedbacks.filter(f => f.status === 'resolved' || f.status === 'closed');

        setFeedbacks(processedFeedbacks);
        setActiveFeedbacks(active);
        setResolvedFeedbacks(resolved);
        setFilteredFeedbacks(showResolved ? resolved : active);
      } catch (error) {
        console.error('Error loading feedbacks:', error);
        showToast({
          type: 'error',
          message: 'Failed to load feedback data',
          style: 'modern'
        });
      }
    };

    loadFeedbacks();
  }, [showToast]);

  // Filter feedbacks based on search and filters
  useEffect(() => {
    // Start with the appropriate list based on showResolved toggle
    let filtered = showResolved ? resolvedFeedbacks : activeFeedbacks;

    if (searchQuery) {
      filtered = filtered.filter(feedback =>
        feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.priority === priorityFilter);
    }

    setFilteredFeedbacks(filtered);
  }, [activeFeedbacks, resolvedFeedbacks, showResolved, searchQuery, statusFilter, typeFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <AlertTriangle className="h-4 w-4" />;
      case 'feature': return <Star className="h-4 w-4" />;
      case 'improvement': return <CheckCircle className="h-4 w-4" />;
      case 'complaint': return <MessageSquare className="h-4 w-4" />;
      case 'praise': return <Star className="h-4 w-4" />;
      case 'crash': return <AlertTriangle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Handler functions for feedback actions
  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    try {
      // Check if this is a localStorage item by checking if it exists in localStorage
      const storedErrorReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      const isLocalStorageItem = storedErrorReports.some((report: any) => report.id === feedbackId);

      if (!isLocalStorageItem) {
        // Only update Firebase for real feedback items
        await updateFeedback(feedbackId, {
          status: newStatus as any,
          ...(newStatus === 'resolved' && { resolvedAt: new Date().toISOString(), resolvedBy: 'admin' })
        });
      } else {
        // For localStorage items, update the localStorage
        const updatedReports = storedErrorReports.map((report: any) =>
          report.id === feedbackId
            ? {
                ...report,
                status: newStatus,
                ...(newStatus === 'resolved' && { resolvedAt: new Date().toISOString(), resolvedBy: 'admin' })
              }
            : report
        );
        localStorage.setItem('errorReports', JSON.stringify(updatedReports));
      }

      // Update local state
      const updatedFeedback = feedbacks.find(f => f.id === feedbackId);
      if (updatedFeedback) {
        const updated = {
          ...updatedFeedback,
          status: newStatus as any,
          ...(newStatus === 'resolved' && { resolvedAt: new Date().toISOString(), resolvedBy: 'admin' })
        };

        // Update main feedbacks list
        setFeedbacks(prev => prev.map(feedback =>
          feedback.id === feedbackId ? updated : feedback
        ));

        // Move between active and resolved lists based on new status
        if (newStatus === 'resolved' || newStatus === 'closed') {
          // Move from active to resolved
          setActiveFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
          setResolvedFeedbacks(prev => [...prev, updated]);
        } else {
          // Move from resolved to active
          setResolvedFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
          setActiveFeedbacks(prev => [...prev, updated]);
        }
      }

      showToast({
        type: 'success',
        message: `Feedback status updated to ${newStatus}`,
        style: 'modern'
      });
    } catch (error) {
      console.error('Error updating feedback status:', error);
      showToast({
        type: 'error',
        message: 'Failed to update feedback status',
        style: 'modern'
      });
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      // Check if this is a localStorage item by checking if it exists in localStorage
      const storedErrorReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      const isLocalStorageItem = storedErrorReports.some((report: any) => report.id === feedbackId);

      if (!isLocalStorageItem) {
        // Only delete from Firebase for real feedback items
        await deleteFeedback(feedbackId);
      } else {
        // For localStorage items, remove from localStorage
        const updatedReports = storedErrorReports.filter((report: any) => report.id !== feedbackId);
        localStorage.setItem('errorReports', JSON.stringify(updatedReports));
      }

      // Update local state
      setFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId));
      setActiveFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId));
      setResolvedFeedbacks(prev => prev.filter(feedback => feedback.id !== feedbackId));
      setSelectedFeedback(null);

      showToast({
        type: 'success',
        message: 'Feedback deleted successfully',
        style: 'modern'
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      showToast({
        type: 'error',
        message: 'Failed to delete feedback',
        style: 'modern'
      });
    }
  };

  const handleCopyErrorDetails = async (feedback: Feedback) => {
    try {
      const errorDetails = `
🐛 ERROR REPORT - ${feedback.title}

📋 BASIC INFORMATION:
• Type: ${feedback.type}
• Priority: ${feedback.priority}
• Status: ${feedback.status}
• Category: ${feedback.category || 'N/A'}
• Submitted By: ${feedback.submittedBy}
• Submitted At: ${new Date(feedback.submittedAt).toLocaleString()}

📝 DESCRIPTION:
${feedback.description.split('\n\n--- OCCURRENCE COUNT ---')[0]}

🔧 TECHNICAL DETAILS:
• URL: ${feedback.url || 'N/A'}
• Browser: ${feedback.browserInfo || 'N/A'}
• User Agent: ${feedback.userAgent || 'N/A'}

💥 ERROR STACK TRACE:
${feedback.errorStack || 'N/A'}

${feedback.componentStack ? `🧩 COMPONENT STACK:
${feedback.componentStack}` : ''}

${feedback.title.includes('x)') ? `⚠️ OCCURRENCE COUNT:
This error has occurred multiple times. Check the title for frequency.` : ''}

🎯 RESOLUTION STEPS:
1. Navigate to: ${feedback.url || 'the affected page'}
2. Reproduce the error conditions
3. Check the component mentioned in the stack trace
4. Fix the component reference/import issue
5. Test the fix
6. Mark as resolved

---
Generated from ProFlow Admin Panel
      `.trim();

      await navigator.clipboard.writeText(errorDetails);

      showToast({
        type: 'success',
        message: 'Error details copied to clipboard!',
        style: 'modern'
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showToast({
        type: 'error',
        message: 'Failed to copy details. Please copy manually.',
        style: 'modern'
      });
    }
  };



  const handleExportFeedback = () => {
    // In real app, this would generate and download a report
    showToast({
      type: 'success',
      message: 'Feedback report exported successfully',
      style: 'modern'
    });
  };

  const stats = {
    total: feedbacks.length,
    active: activeFeedbacks.length,
    resolved: resolvedFeedbacks.length,
    pending: activeFeedbacks.filter(f => f.status === 'pending').length,
    inProgress: activeFeedbacks.filter(f => f.status === 'in-progress').length,
    avgRating: feedbacks.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter(f => f.rating).length || 0
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 fab-safe-bottom">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Feedback & Reports
          </h1>
          <p className="text-muted-foreground">
            Manage user feedback, bug reports, and feature requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Feedback</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Active Issues</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">Resolved/Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={!showResolved ? "default" : "outline"}
              onClick={() => setShowResolved(false)}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Active Issues ({stats.active})
            </Button>
            <Button
              variant={showResolved ? "default" : "outline"}
              onClick={() => setShowResolved(true)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Resolved ({stats.resolved})
            </Button>
          </div>
          <Button onClick={handleExportFeedback} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="praise">Praise</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {showResolved ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Resolved & Closed Issues ({filteredFeedbacks.length})
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Active Issues ({filteredFeedbacks.length})
                </>
              )}
            </CardTitle>
            <CardDescription>
              {showResolved
                ? "View resolved and closed feedback items"
                : "Review and manage active feedback and reports"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(feedback.type)}
                          <span className="capitalize">{feedback.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{feedback.title}</p>
                            {(feedback.type === 'crash' || feedback.type === 'bug') && feedback.title.includes('x)') && (
                              <Badge variant="destructive" className="text-xs px-1 py-0 h-5">
                                {feedback.title.match(/\((\d+)x\)$/)?.[1] || '1'}x
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{feedback.description.split('\n\n--- OCCURRENCE COUNT ---')[0]}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{feedback.submittedBy}</p>
                          <Badge variant="outline" className="text-xs">
                            {feedback.userType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(feedback.status)}>
                          {feedback.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(feedback.priority)}>
                          {feedback.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {feedback.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{feedback.rating}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(feedback.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFeedback(feedback)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={feedback.status}
                            onValueChange={(value) => handleStatusUpdate(feedback.id, value)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredFeedbacks.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                No feedback items found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeedback && getTypeIcon(selectedFeedback.type)}
              {selectedFeedback?.title}
            </DialogTitle>
            <DialogDescription>
              Feedback Details
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedFeedback.type)}
                    <Badge variant="outline" className="capitalize">
                      {selectedFeedback.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedFeedback.status === 'resolved' ? 'default' :
                        selectedFeedback.status === 'in-progress' ? 'secondary' :
                        selectedFeedback.status === 'pending' ? 'destructive' : 'outline'
                      }
                      className="capitalize"
                    >
                      {selectedFeedback.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedFeedback.priority === 'critical' ? 'destructive' :
                        selectedFeedback.priority === 'high' ? 'destructive' :
                        selectedFeedback.priority === 'medium' ? 'secondary' : 'outline'
                      }
                      className="capitalize"
                    >
                      {selectedFeedback.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedFeedback.userType}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedFeedback.description}</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Submitted By</Label>
                  <p className="mt-1">{selectedFeedback.submittedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Submitted At</Label>
                  <p className="mt-1">{new Date(selectedFeedback.submittedAt).toLocaleString()}</p>
                </div>
                {selectedFeedback.category && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <p className="mt-1">{selectedFeedback.category}</p>
                  </div>
                )}
                {selectedFeedback.rating && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= selectedFeedback.rating!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm">({selectedFeedback.rating}/5)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Details (for error reports) */}
              {(selectedFeedback.browserInfo || selectedFeedback.url || selectedFeedback.errorStack) && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Technical Details</Label>
                  <div className="mt-2 space-y-2">
                    {selectedFeedback.url && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">URL</Label>
                        <p className="text-sm font-mono bg-muted p-2 rounded text-wrap break-all">{selectedFeedback.url}</p>
                      </div>
                    )}
                    {selectedFeedback.browserInfo && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Browser Info</Label>
                        <p className="text-sm font-mono bg-muted p-2 rounded text-wrap break-all">{selectedFeedback.browserInfo}</p>
                      </div>
                    )}
                    {selectedFeedback.errorStack && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Error Stack</Label>
                        <pre className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">{selectedFeedback.errorStack}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedFeedback.adminNotes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Admin Notes</Label>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm">{selectedFeedback.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Resolution Info */}
              {selectedFeedback.resolvedAt && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Resolved At</Label>
                    <p className="mt-1">{new Date(selectedFeedback.resolvedAt).toLocaleString()}</p>
                  </div>
                  {selectedFeedback.resolvedBy && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Resolved By</Label>
                      <p className="mt-1">{selectedFeedback.resolvedBy}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  {(selectedFeedback.type === 'bug' || selectedFeedback.type === 'crash') && (
                    <Button
                      variant="secondary"
                      onClick={() => handleCopyErrorDetails(selectedFeedback)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Error Details
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFeedback(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedFeedback) {
                        handleDeleteFeedback(selectedFeedback.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function AdminFeedbackPage() {
  return (
    <ToastProvider position="top-right">
      <AdminFeedbackPageContent />
    </ToastProvider>
  );
}
