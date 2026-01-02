
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExportCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  data: Record<string, unknown>[];
  filename: string;
}

export default function ExportCard({
  title,
  description,
  buttonLabel,
  data,
  filename,
}: ExportCardProps) {
  const { toast } = useToast();

  const convertToCSV = (objArray: Record<string, unknown>[]) => {
    if (!objArray || objArray.length === 0) {
      return '';
    }
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const header = Object.keys(array[0]);

    // Quote headers
    str += header.map(h => `"${h}"`).join(',') + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let j = 0; j < header.length; j++) {
        if (line !== '') line += ',';
        const value = array[i][header[j]];
        line += `"${String(value ?? '').replace(/"/g, '""')}"`;
      }
      str += line + '\r\n';
    }
    return str;
  };

  const handleExport = () => {
    if (data.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There is no data available to be exported.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: 'Export Successful!',
          description: `${filename} has been downloaded.`,
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: 'Export Failed',
        description: 'Could not export the data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="glass-card border-white/10 rounded-[2rem] shadow-xl overflow-hidden group hover:border-primary/50 transition-all duration-500">
      <CardHeader className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <FileDown className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="font-medium text-muted-foreground/70">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 md:px-8 pb-6">
        <div className="p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5 space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">Data Package</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold truncate pr-4">{filename}</span>
            <Badge variant="outline" className="shrink-0 bg-background/50 font-mono text-[10px]">
              {data.length} ROWS
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 md:px-8 pb-8">
        <Button
          onClick={handleExport}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          <FileDown className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
