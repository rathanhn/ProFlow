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
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { useToast, ToastProvider } from '@/components/ui/toast-system';

interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'complaint' | 'praise';
  title: string;
  description: string;
  rating?: number;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  submittedBy: string;
  submittedAt: string;
  clientId?: string;
  creatorId?: string;
  userType: 'client' | 'creator' | 'admin';
  category: string;
  attachments?: string[];
  adminNotes?: string;
}

function AdminFeedbackPageContent() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const { showToast } = useToast();

  // Load data from localStorage and mock data - In real app, this would come from API
  useEffect(() => {
    // Load error reports from localStorage
    const storedErrorReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
    const errorReportFeedbacks: FeedbackItem[] = storedErrorReports.map((report: any) => ({
      id: report.id,
      type: report.type === 'crash' ? 'bug' : report.type,
      title: report.title,
      description: report.description,
      status: report.status,
      priority: report.priority,
      submittedBy: report.submittedBy,
      submittedAt: report.submittedAt,
      userType: report.userType,
      category: report.category || 'System Error',
      rating: undefined
    }));

    const mockFeedbacks: FeedbackItem[] = [
      {
        id: '1',
        type: 'bug',
        title: 'Payment page not loading on mobile',
        description: 'When I try to access the payment page on my mobile device, it shows a blank screen. This happens consistently on both Chrome and Safari.',
        status: 'pending',
        priority: 'high',
        submittedBy: 'John Doe',
        submittedAt: '2024-01-15T10:30:00Z',
        clientId: 'client123',
        userType: 'client',
        category: 'Technical Issue',
        rating: 2
      },
      {
        id: '2',
        type: 'feature',
        title: 'Add dark mode support',
        description: 'It would be great to have a dark mode option for better viewing in low light conditions.',
        status: 'in-progress',
        priority: 'medium',
        submittedBy: 'Jane Smith',
        submittedAt: '2024-01-14T15:45:00Z',
        creatorId: 'creator456',
        userType: 'creator',
        category: 'UI/UX Enhancement',
        rating: 4
      },
      {
        id: '3',
        type: 'praise',
        title: 'Excellent project management features',
        description: 'The new project tracking features are fantastic! They have really improved our workflow efficiency.',
        status: 'resolved',
        priority: 'low',
        submittedBy: 'Mike Johnson',
        submittedAt: '2024-01-13T09:20:00Z',
        clientId: 'client789',
        userType: 'client',
        category: 'General Feedback',
        rating: 5
      },
      {
        id: '4',
        type: 'improvement',
        title: 'Better notification system needed',
        description: 'Current notifications are too frequent and not well categorized. Need better filtering options.',
        status: 'pending',
        priority: 'medium',
        submittedBy: 'Sarah Wilson',
        submittedAt: '2024-01-12T14:10:00Z',
        creatorId: 'creator101',
        userType: 'creator',
        category: 'Notifications',
        rating: 3
      },
      {
        id: '5',
        type: 'complaint',
        title: 'Slow loading times',
        description: 'The dashboard takes too long to load, especially during peak hours. This affects productivity.',
        status: 'in-progress',
        priority: 'high',
        submittedBy: 'David Brown',
        submittedAt: '2024-01-11T11:30:00Z',
        clientId: 'client202',
        userType: 'client',
        category: 'Performance',
        rating: 2
      }
    ];

    // Combine error reports and mock feedback
    const allFeedbacks = [...errorReportFeedbacks, ...mockFeedbacks];
    setFeedbacks(allFeedbacks);
    setFilteredFeedbacks(allFeedbacks);
  }, []);

  // Filter feedbacks based on search and filters
  useEffect(() => {
    let filtered = feedbacks;

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
  }, [feedbacks, searchQuery, statusFilter, typeFilter, priorityFilter]);

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
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (feedbackId: string, newStatus: string) => {
    setFeedbacks(prev => prev.map(feedback =>
      feedback.id === feedbackId ? { ...feedback, status: newStatus as any } : feedback
    ));
    showToast({
      type: 'success',
      message: 'Feedback status updated successfully',
      style: 'modern'
    });
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
    pending: feedbacks.filter(f => f.status === 'pending').length,
    inProgress: feedbacks.filter(f => f.status === 'in-progress').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
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
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
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
              <Button onClick={handleExportFeedback} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Items ({filteredFeedbacks.length})</CardTitle>
            <CardDescription>
              Review and manage user feedback and reports
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
                          <p className="font-medium truncate">{feedback.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{feedback.description}</p>
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
