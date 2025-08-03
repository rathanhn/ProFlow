'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type ToastStyle = 'modern' | 'minimal' | 'glass' | 'android';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  style?: ToastStyle;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: {
    modern: 'bg-green-50 border-green-200 text-green-800',
    minimal: 'bg-green-100 border-green-300 text-green-900',
    glass: 'bg-green-500/10 border-green-500/20 text-green-700 backdrop-blur-xl',
    android: 'bg-green-600 text-white shadow-lg',
  },
  error: {
    modern: 'bg-red-50 border-red-200 text-red-800',
    minimal: 'bg-red-100 border-red-300 text-red-900',
    glass: 'bg-red-500/10 border-red-500/20 text-red-700 backdrop-blur-xl',
    android: 'bg-red-600 text-white shadow-lg',
  },
  warning: {
    modern: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    minimal: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    glass: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 backdrop-blur-xl',
    android: 'bg-yellow-600 text-white shadow-lg',
  },
  info: {
    modern: 'bg-blue-50 border-blue-200 text-blue-800',
    minimal: 'bg-blue-100 border-blue-300 text-blue-900',
    glass: 'bg-blue-500/10 border-blue-500/20 text-blue-700 backdrop-blur-xl',
    android: 'bg-blue-600 text-white shadow-lg',
  },
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
  position: ToastPosition;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, position }) => {
  const Icon = toastIcons[toast.type];
  const style = toast.style || 'modern';
  const colorClasses = toastColors[toast.type][style];

  const getAnimationClass = () => {
    if (position.includes('right')) return 'animate-slide-in-right';
    if (position.includes('left')) return 'animate-slide-in-left';
    if (position.includes('top')) return 'animate-slide-down';
    return 'animate-slide-up';
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full transition-all duration-300',
        colorClasses,
        getAnimationClass(),
        style === 'android' && 'rounded-md',
        style === 'glass' && 'backdrop-blur-xl'
      )}
    >
      <Icon className={cn(
        'h-5 w-5 flex-shrink-0 mt-0.5',
        style === 'android' ? 'text-white' : `text-${toast.type === 'warning' ? 'yellow' : toast.type}-600`
      )} />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className={cn(
            'font-semibold text-sm mb-1',
            style === 'android' ? 'text-white' : 'text-current'
          )}>
            {toast.title}
          </h4>
        )}
        <p className={cn(
          'text-sm leading-relaxed',
          style === 'android' ? 'text-white/90' : 'text-current opacity-90'
        )}>
          {toast.message}
        </p>
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={cn(
              'mt-2 text-xs font-medium underline hover:no-underline transition-all',
              style === 'android' ? 'text-white' : 'text-current'
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className={cn(
          'flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors',
          style === 'android' ? 'text-white hover:bg-white/20' : 'text-current'
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  position?: ToastPosition;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onClose, 
  position = 'top-right' 
}) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className={cn('fixed z-50 pointer-events-none', positionClasses[position])}>
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={onClose}
            position={position}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'top-right',
  defaultDuration = 5000 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration ?? defaultDuration,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration);
    }
  }, [defaultDuration]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} position={position} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
