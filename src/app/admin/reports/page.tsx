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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Users,
  CreditCard,
  Clock,
  FileSpreadsheet,
  FilePdf,
  Mail
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-system';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'financial' | 'operational' | 'client' | 'performance';
  fields: string[];
  formats: ('pdf' | 'excel' | 'csv')[];
}

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState('30d');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [emailReport, setEmailReport] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      description: 'Revenue, expenses, and profit analysis',
      icon: CreditCard,
      category: 'financial',
      fields: ['Total Revenue', 'Monthly Breakdown', 'Payment Status', 'Outstanding Amounts'],
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'task-performance',
      name: 'Task Performance',
      description: 'Task completion rates and timeline analysis',
      icon: BarChart3,
      category: 'performance',
      fields: ['Completion Rate', 'Average Duration', 'Overdue Tasks', 'Creator Performance'],
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'client-activity',
      name: 'Client Activity',
      description: 'Client engagement and project history',
      icon: Users,
      category: 'client',
      fields: ['Active Clients', 'Project Count', 'Revenue per Client', 'Client Satisfaction'],
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'operational-overview',
      name: 'Operational Overview',
      description: 'Overall business operations and workflow',
      icon: Clock,
      category: 'operational',
      fields: ['Task Distribution', 'Resource Utilization', 'Workflow Efficiency', 'Bottlenecks'],
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'monthly-summary',
      name: 'Monthly Summary',
      description: 'Comprehensive monthly business report',
      icon: Calendar,
      category: 'operational',
      fields: ['Revenue Summary', 'Task Metrics', 'Client Updates', 'Growth Analysis'],
      formats: ['pdf', 'excel']
    },
    {
      id: 'creator-productivity',
      name: 'Creator Productivity',
      description: 'Individual creator performance and workload',
      icon: Users,
      category: 'performance',
      fields: ['Tasks Completed', 'Quality Metrics', 'Delivery Time', 'Client Feedback'],
      formats: ['pdf', 'excel', 'csv']
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      showToast({
        type: 'warning',
        message: 'Please select a report template',
        style: 'modern'
      });
      return;
    }

    setGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = reportTemplates.find(t => t.id === selectedReport);
      
      showToast({
        type: 'success',
        title: 'Report Generated',
        message: `${template?.name} has been generated successfully`,
        style: 'modern',
        action: {
          label: 'Download',
          onClick: () => console.log('Download report')
        }
      });

      if (emailReport) {
        showToast({
          type: 'info',
          message: 'Report has been sent to your email',
          style: 'modern'
        });
      }

    } catch (error) {
      showToast({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate report. Please try again.',
        style: 'modern'
      });
    } finally {
      setGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'text-green-600 bg-green-50 border-green-200';
      case 'performance': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'client': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'operational': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'financial': return 'Financial Reports';
      case 'performance': return 'Performance Reports';
      case 'client': return 'Client Reports';
      case 'operational': return 'Operational Reports';
      default: return 'Other Reports';
    }
  };

  const categories = ['financial', 'performance', 'client', 'operational'];

  return (
    <DashboardLayout>
      <div className="space-y-6 fab-safe-bottom">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download detailed business reports
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Templates */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => (
              <div key={category} className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {getCategoryTitle(category)}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTemplates
                    .filter(template => template.category === category)
                    .map(template => {
                      const Icon = template.icon;
                      const isSelected = selectedReport === template.id;
                      
                      return (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected ? 'ring-2 ring-primary border-primary' : ''
                          }`}
                          onClick={() => setSelectedReport(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg border ${getCategoryColor(template.category)}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm mb-1">
                                  {template.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {template.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {template.formats.map(fmt => (
                                    <Badge key={fmt} variant="outline" className="text-xs">
                                      {fmt.toUpperCase()}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Report Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Report Configuration
                </CardTitle>
                <CardDescription>
                  Customize your report settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="6m">Last 6 months</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={format} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FilePdf className="h-4 w-4" />
                          PDF Document
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel Spreadsheet
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          CSV File
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-charts" 
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                    />
                    <Label htmlFor="include-charts" className="text-sm">
                      Include charts and graphs
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="email-report" 
                      checked={emailReport}
                      onCheckedChange={(checked) => setEmailReport(checked as boolean)}
                    />
                    <Label htmlFor="email-report" className="text-sm">
                      Email report to me
                    </Label>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateReport}
                  disabled={!selectedReport || generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {selectedReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const template = reportTemplates.find(t => t.id === selectedReport);
                    if (!template) return null;
                    
                    return (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Included sections:</p>
                          {template.fields.map(field => (
                            <div key={field} className="flex items-center gap-2 text-xs">
                              <div className="w-1 h-1 bg-primary rounded-full"></div>
                              {field}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
