'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileImageViewer, useProfileImageViewer } from '@/components/ui/profile-image-viewer';
import { cn } from '@/lib/utils';

interface ClickableAvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  userName?: string;
  userEmail?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const ClickableAvatar: React.FC<ClickableAvatarProps> = ({
  src,
  alt,
  fallback,
  userName,
  userEmail,
  className,
  size = 'md',
}) => {
  const { isOpen, imageData, openViewer, closeViewer } = useProfileImageViewer();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const imageUrl = src || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || fallback)}&size=400&background=0ea5e9&color=ffffff&bold=true`;
    openViewer(imageUrl, userName || fallback, userEmail);
  };

  return (
    <>
      <Avatar
        className={cn(
          sizeClasses[size],
          'cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all duration-200',
          className
        )}
        onClick={handleClick}
      >
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>

      {/* Profile Image Viewer */}
      <ProfileImageViewer
        isOpen={isOpen}
        onClose={closeViewer}
        imageUrl={imageData.imageUrl}
        userName={imageData.userName}
        userEmail={imageData.userEmail}
      />
    </>
  );
};

export default ClickableAvatar;
