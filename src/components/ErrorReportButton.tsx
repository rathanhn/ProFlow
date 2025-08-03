'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Bug,
  Send,
  Camera,
  Paperclip
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-system';

interface ErrorReportData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  steps: string;
  expectedBehavior: string;
  actualBehavior: string;
  browserInfo: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

interface ErrorReportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  errorContext?: {
    page?: string;
    component?: string;
    action?: string;
    errorMessage?: string;
  };
}

export default function ErrorReportButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  errorContext 
}: ErrorReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportData, setReportData] = useState<ErrorReportData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    steps: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: '',
    url: '',
    userAgent: '',
    timestamp: ''
  });
  // Safe toast hook that doesn't throw if ToastProvider is not available
  const safeShowToast = (() => {
    try {
      const { showToast } = useToast();
      return showToast;
    } catch (error) {
      // Fallback to console.log if ToastProvider is not available
      return (options: any) => {
        console.log(`Toast: ${options.title || options.message}`, options);
      };
    }
  })();

  // Auto-populate technical details when dialog opens
  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      const now = new Date().toISOString();
      const browserInfo = `${navigator.userAgent}`;
      const url = window.location.href;
      
      setReportData(prev => ({
        ...prev,
        browserInfo,
        url,
        userAgent: navigator.userAgent,
        timestamp: now,
        title: errorContext?.errorMessage ? `Error: ${errorContext.errorMessage}` : '',
        description: errorContext ? 
          `Page: ${errorContext.page || 'Unknown'}\nComponent: ${errorContext.component || 'Unknown'}\nAction: ${errorContext.action || 'Unknown'}` : 
          ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!reportData.title || !reportData.description) {
      safeShowToast({
        type: 'warning',
        message: 'Please fill in the title and description',
        style: 'modern'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would send to your error reporting service
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store in localStorage for admin panel (in real app, this would be sent to backend)
      const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      const newReport = {
        id: Date.now().toString(),
        ...reportData,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        submittedBy: 'Current User', // In real app, get from auth context
        userType: 'admin' // In real app, get from auth context
      };
      
      existingReports.push(newReport);
      localStorage.setItem('errorReports', JSON.stringify(existingReports));

      safeShowToast({
        type: 'success',
        title: 'Error Report Submitted',
        message: 'Thank you for reporting this issue. We\'ll investigate it promptly.',
        style: 'modern'
      });

      // Reset form
      setReportData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        steps: '',
        expectedBehavior: '',
        actualBehavior: '',
        browserInfo: '',
        url: '',
        userAgent: '',
        timestamp: ''
      });
      
      setIsOpen(false);
    } catch (error) {
      safeShowToast({
        type: 'error',
        message: 'Failed to submit error report. Please try again.',
        style: 'modern'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Bug className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Help us improve ProFlow by reporting bugs, issues, or unexpected behavior.
            Your feedback is valuable to us.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                value={reportData.title}
                onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={reportData.category}
                  onValueChange={(value) => setReportData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui-bug">UI/Display Bug</SelectItem>
                    <SelectItem value="functionality">Functionality Issue</SelectItem>
                    <SelectItem value="performance">Performance Problem</SelectItem>
                    <SelectItem value="data-loss">Data Loss/Corruption</SelectItem>
                    <SelectItem value="security">Security Concern</SelectItem>
                    <SelectItem value="mobile">Mobile Specific</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={reportData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                    setReportData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                    <SelectItem value="medium">Medium - Affects workflow</SelectItem>
                    <SelectItem value="high">High - Major functionality broken</SelectItem>
                    <SelectItem value="critical">Critical - System unusable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={reportData.description}
                onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue..."
                rows={3}
              />
            </div>
          </div>

          {/* Detailed Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="steps">Steps to Reproduce</Label>
              <Textarea
                id="steps"
                value={reportData.steps}
                onChange={(e) => setReportData(prev => ({ ...prev, steps: e.target.value }))}
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expected">Expected Behavior</Label>
                <Textarea
                  id="expected"
                  value={reportData.expectedBehavior}
                  onChange={(e) => setReportData(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                  placeholder="What should have happened?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual">Actual Behavior</Label>
                <Textarea
                  id="actual"
                  value={reportData.actualBehavior}
                  onChange={(e) => setReportData(prev => ({ ...prev, actualBehavior: e.target.value }))}
                  placeholder="What actually happened?"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Technical Information</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>URL:</strong> {reportData.url}</p>
                <p><strong>Browser:</strong> {reportData.browserInfo}</p>
                <p><strong>Timestamp:</strong> {reportData.timestamp}</p>
              </div>
            </div>

            {reportData.priority && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Priority:</span>
                <Badge className={getPriorityColor(reportData.priority)}>
                  {reportData.priority.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reportData.title || !reportData.description}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
