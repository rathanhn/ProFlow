'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './button';

export type PopupVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type PopupStyle = 'modern' | 'glass' | 'minimal' | 'android' | 'ios';

interface ModernPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: PopupVariant;
  style?: PopupStyle;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const variantIcons = {
  default: null,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantColors = {
  default: 'border-border',
  success: 'border-green-200 bg-green-50/50',
  error: 'border-red-200 bg-red-50/50',
  warning: 'border-yellow-200 bg-yellow-50/50',
  info: 'border-blue-200 bg-blue-50/50',
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export const ModernPopup: React.FC<ModernPopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default',
  style = 'modern',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const Icon = variantIcons[variant];

  const getStyleClasses = () => {
    switch (style) {
      case 'glass':
        return 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl';
      case 'minimal':
        return 'bg-white border border-gray-200 shadow-lg';
      case 'android':
        return 'bg-white rounded-lg shadow-2xl border-0';
      case 'ios':
        return 'bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border-0';
      default:
        return 'bg-background border border-border shadow-xl';
    }
  };

  const getOverlayClasses = () => {
    switch (style) {
      case 'glass':
        return 'bg-black/30 backdrop-blur-sm';
      case 'minimal':
        return 'bg-black/50';
      case 'android':
        return 'bg-black/60';
      case 'ios':
        return 'bg-black/20 backdrop-blur-sm';
      default:
        return 'bg-black/50 backdrop-blur-sm';
    }
  };

  const getAnimationClasses = () => {
    switch (style) {
      case 'android':
        return 'animate-android-scale-in';
      case 'ios':
        return 'animate-android-bounce';
      case 'glass':
        return 'animate-fade-in animate-scale-in';
      default:
        return 'animate-slide-up';
    }
  };

  const popup = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          getOverlayClasses()
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Popup Content */}
      <div
        className={cn(
          'relative w-full rounded-xl transition-all duration-300',
          sizeClasses[size],
          getStyleClasses(),
          getAnimationClasses(),
          variantColors[variant],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <Icon className={cn(
                  'h-5 w-5',
                  variant === 'success' && 'text-green-600',
                  variant === 'error' && 'text-red-600',
                  variant === 'warning' && 'text-yellow-600',
                  variant === 'info' && 'text-blue-600'
                )} />
              )}
              {title && (
                <h2 className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'px-6',
          (title || showCloseButton) ? 'pb-6' : 'py-6'
        )}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(popup, document.body);
};

// Preset popup components
export const SuccessPopup: React.FC<Omit<ModernPopupProps, 'variant'>> = (props) => (
  <ModernPopup {...props} variant="success" />
);

export const ErrorPopup: React.FC<Omit<ModernPopupProps, 'variant'>> = (props) => (
  <ModernPopup {...props} variant="error" />
);

export const WarningPopup: React.FC<Omit<ModernPopupProps, 'variant'>> = (props) => (
  <ModernPopup {...props} variant="warning" />
);

export const InfoPopup: React.FC<Omit<ModernPopupProps, 'variant'>> = (props) => (
  <ModernPopup {...props} variant="info" />
);

// Hook for managing popup state
export const usePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ModernPopupProps>>({});

  const openPopup = (popupConfig?: Partial<ModernPopupProps>) => {
    if (popupConfig) {
      setConfig(popupConfig);
    }
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openPopup,
    closePopup,
    config,
  };
};
