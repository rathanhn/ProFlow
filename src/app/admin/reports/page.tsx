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
  File,
  Mail,
  Zap,
  Activity,
  Award,
  Shield,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast, ToastProvider } from '@/components/ui/toast-system';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'financial' | 'operational' | 'client' | 'performance';
  fields: string[];
  formats: ('pdf' | 'excel' | 'csv')[];
}

function AdminReportsPageContent() {
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

  const categories = [
    { id: 'financial', icon: CreditCard },
    { id: 'performance', icon: BarChart3 },
    { id: 'client', icon: Users },
    { id: 'operational', icon: Clock }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 fab-safe-bottom">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-indigo-950 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FileText className="h-64 w-64 rotate-12" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-black uppercase tracking-[0.2em] text-[10px]">
                  Operational Documentation v3.0
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                  Intelligence <span className="text-indigo-400">Reports</span>
                </h1>
                <p className="text-indigo-200/60 font-medium max-w-lg">
                  Generate structural business dossiers, financial audits, and performance telemetry for the entire network.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-indigo-900 bg-indigo-800 flex items-center justify-center text-[10px] font-black">R{i}</div>
                  ))}
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Archived Versions</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Vault Secured</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Templates Loaded</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Templates */}
          <div className="lg:col-span-2 space-y-10">
            {categories.map(cat => (
              <div key={cat.id} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <cat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    {getCategoryTitle(cat.id)}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTemplates
                    .filter(template => template.category === cat.id)
                    .map(template => {
                      const Icon = template.icon;
                      const isSelected = selectedReport === template.id;

                      return (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer transition-all duration-500 rounded-[2rem] border-white/10 overflow-hidden relative group",
                            isSelected ? "bg-indigo-600/10 border-indigo-500 shadow-2xl scale-[1.02]" : "bg-white/5 hover:bg-white/[0.08] hover:border-white/20"
                          )}
                          onClick={() => setSelectedReport(template.id)}
                        >
                          {isSelected && (
                            <div className="absolute top-0 right-0 p-4">
                              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "p-3 rounded-2xl border transition-colors duration-500",
                                isSelected ? "bg-indigo-600 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-muted-foreground group-hover:text-white"
                              )}>
                                <Icon className="h-6 w-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black text-sm uppercase tracking-tight mb-1">
                                  {template.name}
                                </h3>
                                <p className="text-xs text-muted-foreground/60 mb-4 line-clamp-2 leading-relaxed font-medium">
                                  {template.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {template.formats.map(fmt => (
                                    <Badge key={fmt} variant="outline" className="text-[9px] font-black tracking-widest bg-white/5 border-white/10 px-2 uppercase">
                                      {fmt}
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
            <Card className="glass-card border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              <CardHeader className="pt-8">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Filter className="h-6 w-6 text-indigo-500" />
                  Configuration
                </CardTitle>
                <CardDescription className="font-medium">
                  Refine parameters for documentation generation.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Operational Window</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="rounded-2xl border-white/10 bg-white/5 h-12 focus:ring-indigo-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem value="7d">Last 7 Operational Days</SelectItem>
                      <SelectItem value="30d">Last 30 Operational Days</SelectItem>
                      <SelectItem value="90d">Full Quarter Audit</SelectItem>
                      <SelectItem value="6m">Semi-Annual Review</SelectItem>
                      <SelectItem value="1y">Annual Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Export Vector</Label>
                  <Select value={format} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setFormat(value)}>
                    <SelectTrigger className="rounded-2xl border-white/10 bg-white/5 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-rose-500" />
                          PDF Encrypted
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-emerald-500" />
                          Excel Registry
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          CSV Telemetry
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Label htmlFor="include-charts" className="text-xs font-bold uppercase tracking-tight cursor-pointer">
                      Visual Analytics
                    </Label>
                    <Checkbox
                      id="include-charts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                      className="rounded-md border-white/20 data-[state=checked]:bg-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Label htmlFor="email-report" className="text-xs font-bold uppercase tracking-tight cursor-pointer">
                      Transmission
                    </Label>
                    <Checkbox
                      id="email-report"
                      checked={emailReport}
                      onCheckedChange={(checked) => setEmailReport(checked as boolean)}
                      className="rounded-md border-white/20 data-[state=checked]:bg-indigo-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedReport || generating}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300",
                    generating ? "bg-slate-800" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                  )}
                >
                  {generating ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Initiate Generation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {selectedReport && (
              <Card className="glass-card border-indigo-500/20 rounded-[2.5rem] bg-indigo-500/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Registry Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const template = reportTemplates.find(t => t.id === selectedReport);
                    if (!template) return null;

                    return (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-lg uppercase tracking-tight">{template.name}</h4>
                          <p className="text-xs text-muted-foreground/60 leading-relaxed">{template.description}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">Telemetry Nodes</p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {template.fields.map(field => (
                              <div key={field} className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80 bg-white/5 p-2 rounded-xl">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>
                                {field}
                              </div>
                            ))}
                          </div>
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

export default function AdminReportsPage() {
  return (
    <ToastProvider position="top-right">
      <AdminReportsPageContent />
    </ToastProvider>
  );
}
