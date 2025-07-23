
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

interface ExportCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  data: any[];
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

  const convertToCSV = (objArray: any[]) => {
    if (!objArray || objArray.length === 0) {
      return '';
    }
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const header = Object.keys(array[0]);
    str += header.join(',') + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in header) {
        if (line !== '') line += ',';
        line += `"${String(array[i][header[index]]).replace(/"/g, '""')}"`;
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          You will be able to download a CSV file containing all the relevant data.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
