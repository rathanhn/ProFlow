'use client';

import React, { useState } from 'react';
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
  HelpCircle,
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Send,
  FileText,
  Video,
  Users,
  Settings,
  CreditCard,
  Shield
} from 'lucide-react';
import { useToast, ToastProvider } from '@/components/ui/toast-system';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
}

function AdminHelpPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [supportTicket, setSupportTicket] = useState<SupportTicket>({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });
  const { showToast } = useToast();

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I add a new client to the system?',
      answer: 'To add a new client, go to the Clients page and click the "Add Client" button. Fill in the required information including name, email, and contact details. The client will receive an invitation email to set up their account.',
      category: 'clients'
    },
    {
      id: '2',
      question: 'How can I track task progress and deadlines?',
      answer: 'You can track task progress from the Tasks page or Calendar view. Each task shows its current status, assigned creator, and deadline. Use the Calendar to see upcoming deadlines and overdue tasks.',
      category: 'tasks'
    },
    {
      id: '3',
      question: 'How do I generate financial reports?',
      answer: 'Go to the Reports page and select "Financial Summary" or other financial report templates. Choose your date range and export format (PDF, Excel, or CSV). Reports include revenue, expenses, and payment status.',
      category: 'reports'
    },
    {
      id: '4',
      question: 'What payment methods are supported?',
      answer: 'ProFlow supports various payment methods including bank transfers, UPI, credit/debit cards, and digital wallets. Payment tracking is automatic when integrated with your payment gateway.',
      category: 'payments'
    },
    {
      id: '5',
      question: 'How do I backup my data?',
      answer: 'Data backup is handled automatically. You can also manually export data from the Export page. For additional backup options, contact support for enterprise backup solutions.',
      category: 'data'
    },
    {
      id: '6',
      question: 'How can I customize notification settings?',
      answer: 'Go to Notifications page to customize your alert preferences. You can enable/disable email notifications, push notifications, and set specific alerts for tasks, payments, and client activities.',
      category: 'settings'
    }
  ];

  const helpCategories = [
    { id: 'getting-started', name: 'Getting Started', icon: Book },
    { id: 'clients', name: 'Client Management', icon: Users },
    { id: 'tasks', name: 'Task Management', icon: FileText },
    { id: 'reports', name: 'Reports & Analytics', icon: FileText },
    { id: 'payments', name: 'Payments & Billing', icon: CreditCard },
    { id: 'settings', name: 'Settings & Security', icon: Settings },
    { id: 'data', name: 'Data & Backup', icon: Shield }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!supportTicket.subject || !supportTicket.category || !supportTicket.description) {
      showToast({
        type: 'warning',
        message: 'Please fill in all required fields',
        style: 'modern'
      });
      return;
    }

    // Simulate ticket submission
    showToast({
      type: 'success',
      title: 'Support Ticket Submitted',
      message: 'We\'ll get back to you within 24 hours',
      style: 'modern'
    });

    setSupportTicket({
      subject: '',
      category: '',
      priority: 'medium',
      description: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 fab-safe-bottom">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-8 w-8" />
            Help & Support
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get help when you need it
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions and answers about using ProFlow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No articles found matching your search.
                    </p>
                  ) : (
                    filteredFAQs.map(faq => (
                      <div key={faq.id} className="border rounded-lg">
                        <button
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        >
                          <span className="font-medium">{faq.question}</span>
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {expandedFAQ === faq.id && (
                          <div className="p-4 pt-0 border-t bg-muted/20">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={supportTicket.subject}
                      onChange={(e) => setSupportTicket(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={supportTicket.category}
                      onValueChange={(value) => setSupportTicket(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="account">Account Management</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={supportTicket.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setSupportTicket(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General question</SelectItem>
                      <SelectItem value="medium">Medium - Issue affecting work</SelectItem>
                      <SelectItem value="high">High - Critical issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={supportTicket.description}
                    onChange={(e) => setSupportTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please provide detailed information about your issue..."
                    rows={4}
                  />
                </div>

                <Button onClick={handleSubmitTicket} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Support Ticket
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {helpCategories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@proflow.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM IST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Video Tutorials</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Book className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">User Guide</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Community Forum</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">All systems operational</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminHelpPage() {
  return (
    <ToastProvider position="top-right">
      <AdminHelpPageContent />
    </ToastProvider>
  );
}
