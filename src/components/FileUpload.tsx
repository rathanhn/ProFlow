
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUploadSignature } from '@/lib/actions';
import { FileUp, FileCheck, Loader2, Eye } from 'lucide-react';
import { Progress } from './ui/progress';

interface FileUploadProps {
  value: string | undefined;
  onChange: (value: string) => void;
  folder?: string;
}

export default function FileUpload({
  value,
  onChange,
  folder,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const { signature, timestamp, folder: signedFolder } = await getUploadSignature({ folder });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.CLOUDINARY_API_KEY!);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      if (signedFolder) {
        formData.append('folder', signedFolder);
      }
      
      const endpoint = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME!}/auto/upload`;
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onChange(data.secure_url);
          toast({
            title: 'File Uploaded!',
            description: 'The file has been successfully uploaded.',
          });
        } else {
          throw new Error('Upload failed with status: ' + xhr.status);
        }
        setIsLoading(false);
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };
      
      xhr.send(formData);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload the file. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const fileName = value ? value.split('/').pop() : 'No file uploaded';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 p-2 border rounded-md">
        <div className="flex items-center gap-2 overflow-hidden">
            {value ? <FileCheck className="h-5 w-5 text-green-500 shrink-0" /> : <FileUp className="h-5 w-5 text-muted-foreground shrink-0" />}
            <span className="text-sm text-muted-foreground truncate" title={fileName}>{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          {value && (
              <Button asChild type="button" variant="outline" size="sm">
                  <a href={value} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-2 h-3.5 w-3.5" /> View
                  </a>
              </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleFileSelect} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileUp className="mr-2 h-3.5 w-3.5" />
            )}
            {value ? 'Change' : 'Upload'}
          </Button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      {isLoading && <Progress value={uploadProgress} className="h-2" />}
    </div>
  );
}

