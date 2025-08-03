
'use client';

import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUploadSignature, deleteFileByUrl } from '@/lib/actions';
import { generateFallbackAvatar, checkCloudinaryConfig } from '@/lib/cloudinary-config';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  fallbackText?: string;
}

export default function ImageUploader({
  value,
  onChange,
  fallbackText = 'U',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async () => {
      if (!value) return;

      if (!confirm("Are you sure you want to remove the profile picture?")) {
        return;
      }
      
      setIsLoading(true);
      try {
        await deleteFileByUrl(value);
        onChange(undefined);
        toast({ title: 'Image Removed' });
      } catch (error) {
        console.error(error);
        toast({ title: 'Delete Failed', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);
    
    // Create a temporary URL to check if the file is the same
    const tempUrl = URL.createObjectURL(file);
    if (value === tempUrl) {
        toast({ title: "Image Unchanged", description: "You've selected the same image."});
        setIsLoading(false);
        return;
    }

    if (value) {
        try {
            await deleteFileByUrl(value);
        } catch (error) {
            console.error("Could not delete old image, proceeding with upload:", error);
        }
    }

    try {
      // Check Cloudinary configuration
      const configCheck = checkCloudinaryConfig();
      if (!configCheck.isValid) {
        throw new Error(`Cloudinary configuration issues: ${configCheck.issues.join(', ')}`);
      }

      const { signature, timestamp, use_filename, unique_filename } = await getUploadSignature({ folder: 'avatars', use_filename: false, unique_filename: true });

      if (!signature) {
        throw new Error('Failed to generate upload signature. Please check server configuration.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', 'avatars');
      formData.append('use_filename', use_filename ? 'true' : 'false');
      formData.append('unique_filename', unique_filename ? 'true' : 'false');


      const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`;
      
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
          toast({ title: 'Image Uploaded!' });
        } else {
          let errorMessage = `Upload failed with status: ${xhr.status}`;
          try {
            const errorData = JSON.parse(xhr.responseText);
            if (errorData.error && errorData.error.message) {
              errorMessage += ` - ${errorData.error.message}`;
            }
          } catch (e) {
            // If response is not JSON, use the status text
            errorMessage += ` - ${xhr.statusText}`;
          }
          console.error('Cloudinary upload error:', xhr.responseText);
          throw new Error(errorMessage);
        }
        setIsLoading(false);
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);

      // Fallback: Generate a placeholder avatar URL
      const fallbackUrl = generateFallbackAvatar(fallbackText, 200);

      toast({
        title: 'Upload Failed - Using Fallback',
        description: 'Using generated avatar. Please check Cloudinary configuration.',
        variant: 'destructive',
      });

      // Use the fallback avatar
      onChange(fallbackUrl);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative group">
        <Avatar className="h-24 w-24 border">
          <AvatarImage src={value || undefined} alt="Profile Avatar" />
          <AvatarFallback>{fallbackText}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <button
              type="button"
              onClick={handleFileSelect}
              className="cursor-pointer rounded-full p-2 text-white"
              aria-label="Change picture"
            >
              <Camera className="h-8 w-8" />
            </button>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        disabled={isLoading}
      />
      <div className="flex items-center gap-2">
        <Button
            type="button"
            variant="outline"
            onClick={handleFileSelect}
            disabled={isLoading}
        >
            {isLoading ? 'Uploading...' : 'Change Picture'}
        </Button>
        {value && (
            <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={isLoading}
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove picture</span>
            </Button>
        )}
      </div>
      {isLoading && <div className="w-full flex items-center gap-2">
        <Progress value={uploadProgress} className="h-2 flex-1" />
        <span className="text-xs font-mono text-muted-foreground">{uploadProgress}%</span>
      </div>}
    </div>
  );
}
