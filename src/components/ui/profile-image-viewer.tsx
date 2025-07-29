'use client';

import React from 'react';
import { X, Download, Share, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { RippleButton } from './ripple-effect';

interface ProfileImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  userName?: string;
  userEmail?: string;
  className?: string;
}

export const ProfileImageViewer: React.FC<ProfileImageViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  userName,
  userEmail,
  className,
}) => {
  const haptic = useHapticFeedback();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset states when opening
  React.useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen, imageUrl]);

  const handleClose = () => {
    haptic.androidClick();
    onClose();
  };

  const handleDownload = async () => {
    haptic.androidClick();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userName || 'profile'}-image.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      haptic.success();
    } catch (error) {
      console.error('Failed to download image:', error);
      haptic.error();
    }
  };

  const handleShare = async () => {
    haptic.androidClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}'s Profile Picture`,
          text: `Check out ${userName}'s profile picture`,
          url: imageUrl,
        });
        haptic.success();
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(imageUrl);
        haptic.success();
        // You could show a toast here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        haptic.error();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm',
        'flex flex-col items-center justify-center',
        'animate-in fade-in-0 duration-300',
        className
      )}
      onClick={handleClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4 safe-area-pt">
          <div className="flex items-center gap-3">
            <RippleButton
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </RippleButton>
            {userName && (
              <div className="text-white">
                <h3 className="font-medium">{userName}</h3>
                {userEmail && (
                  <p className="text-xs text-white/70">{userEmail}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <RippleButton
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </RippleButton>
            <RippleButton
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={handleShare}
            >
              <Share className="h-5 w-5" />
            </RippleButton>
            <RippleButton
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <MoreVertical className="h-5 w-5" />
            </RippleButton>
          </div>
        </div>
      </div>

      {/* Image Container */}
      <div
        className="relative max-w-full max-h-full p-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!imageLoaded && !imageError && (
          <div className="flex items-center justify-center w-64 h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
          </div>
        )}
        
        {imageError && (
          <div className="flex flex-col items-center justify-center text-white p-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <X className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium mb-2">Failed to load image</p>
            <p className="text-sm text-white/70 text-center">
              The image could not be loaded. Please try again later.
            </p>
          </div>
        )}

        <img
          src={imageUrl}
          alt={`${userName}'s profile picture`}
          className={cn(
            'max-w-full max-h-full object-contain rounded-lg shadow-2xl',
            'transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          draggable={false}
        />
      </div>

      {/* Bottom Info */}
      {userName && imageLoaded && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
          <div className="p-4 text-center text-white safe-area-pb">
            <p className="text-sm text-white/70">
              Tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for managing profile image viewer state
export const useProfileImageViewer = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [imageData, setImageData] = React.useState<{
    imageUrl: string;
    userName?: string;
    userEmail?: string;
  }>({ imageUrl: '' });

  const openViewer = (imageUrl: string, userName?: string, userEmail?: string) => {
    setImageData({ imageUrl, userName, userEmail });
    setIsOpen(true);
  };

  const closeViewer = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    imageData,
    openViewer,
    closeViewer,
  };
};

export default ProfileImageViewer;
