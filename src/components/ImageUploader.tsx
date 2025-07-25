
'use client';

import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUploadSignature } from '@/lib/actions';
import { Camera, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value?: string; // Make value optional as it might not be initially available
  onChange?: (value: string) => void; // Make onChange optional if it's not always needed
  fallbackText?: string;
  onUploadComplete: (url: string) => Promise<void>; // Add the new prop
}

export default function ImageUploader({
  value,
  onChange,
  fallbackText = 'U',
  onUploadComplete
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      const { signature, timestamp } = await getUploadSignature();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());

      const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Use the new onUploadComplete prop instead of onChange
        if (onUploadComplete) {
            await onUploadComplete(data.secure_url);
        }
        toast({
          title: 'Image Uploaded!',
          description: 'The profile picture has been updated.',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border">
          <AvatarImage src={value} alt="Profile Avatar" />
          <AvatarFallback>{fallbackText}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <button
              type="button"
              onClick={handleFileSelect}
              className="cursor-pointer rounded-full p-2 text-white"
            >
              <Camera className="h-8 w-8" />
              <span className="sr-only">Change picture</span>
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
      <Button
        type="button"
        variant="outline"
        onClick={handleFileSelect}
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Change Picture'}
      </Button>
    </div>
  );
}
