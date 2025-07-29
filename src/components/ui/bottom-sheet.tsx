'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { X } from 'lucide-react';

interface BottomSheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  snapPoints?: number[]; // Percentage heights: [25, 50, 90]
  defaultSnapPoint?: number;
  dismissible?: boolean;
  className?: string;
}

interface BottomSheetContentProps {
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
}

const BottomSheetContext = React.createContext<{
  snapPoints: number[];
  currentSnapPoint: number;
  setSnapPoint: (point: number) => void;
  onClose: () => void;
} | null>(null);

const useBottomSheet = () => {
  const context = React.useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within BottomSheet');
  }
  return context;
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  open = false,
  onOpenChange,
  snapPoints = [90],
  defaultSnapPoint = 0,
  dismissible = true,
  className,
}) => {
  const [currentSnapPoint, setCurrentSnapPoint] = React.useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);

  const onClose = React.useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const setSnapPoint = React.useCallback((pointIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(pointIndex, snapPoints.length - 1));
    setCurrentSnapPoint(clampedIndex);
  }, [snapPoints]);

  React.useEffect(() => {
    if (open) {
      setCurrentSnapPoint(defaultSnapPoint);
      setDragOffset(0);
    }
  }, [open, defaultSnapPoint]);

  const contextValue = React.useMemo(() => ({
    snapPoints,
    currentSnapPoint,
    setSnapPoint,
    onClose,
  }), [snapPoints, currentSnapPoint, setSnapPoint, onClose]);

  return (
    <BottomSheetContext.Provider value={contextValue}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </DialogPrimitive.Root>
    </BottomSheetContext.Provider>
  );
};

export const BottomSheetTrigger = DialogPrimitive.Trigger;

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  children,
  className,
  showHandle = true,
}) => {
  const { snapPoints, currentSnapPoint, setSnapPoint, onClose } = useBottomSheet();
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const haptic = useHapticFeedback();

  const currentHeight = snapPoints[currentSnapPoint];
  const actualHeight = isDragging 
    ? Math.max(0, Math.min(100, currentHeight - (dragOffset / window.innerHeight) * 100))
    : currentHeight;

  const gestures = useTouchGestures({
    onPanStart: (state) => {
      setIsDragging(true);
      haptic.selection();
    },
    onPan: (state) => {
      if (state.direction === 'down' || state.direction === 'up') {
        setDragOffset(state.deltaY);
      }
    },
    onPanEnd: (state) => {
      setIsDragging(false);
      setDragOffset(0);

      const { deltaY, velocity } = state;
      const threshold = window.innerHeight * 0.1; // 10% of screen height
      
      // Determine next snap point based on drag distance and velocity
      if (deltaY > threshold || velocity > 0.5) {
        // Dragging down - go to lower snap point or close
        if (currentSnapPoint > 0) {
          setSnapPoint(currentSnapPoint - 1);
          haptic.light();
        } else {
          onClose();
          haptic.light();
        }
      } else if (deltaY < -threshold || velocity < -0.5) {
        // Dragging up - go to higher snap point
        if (currentSnapPoint < snapPoints.length - 1) {
          setSnapPoint(currentSnapPoint + 1);
          haptic.light();
        }
      }
    },
  }, {
    swipeThreshold: 20,
    velocityThreshold: 0.3,
  });

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const cleanup = gestures.bindGestures(content);
    return cleanup;
  }, [gestures]);

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={contentRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-xl border-t shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          'data-[state=open]:duration-300 data-[state=closed]:duration-200',
          isDragging ? 'transition-none' : 'transition-all duration-300 ease-out',
          className
        )}
        style={{
          height: `${actualHeight}vh`,
          maxHeight: '95vh',
        }}
      >
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}

        {/* Hidden title for accessibility */}
        <VisuallyHidden.Root>
          <DialogPrimitive.Title>Bottom Sheet</DialogPrimitive.Title>
        </VisuallyHidden.Root>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};

export const BottomSheetHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b', className)}>
    {children}
  </div>
);

export const BottomSheetTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <DialogPrimitive.Title className={cn('text-lg font-semibold', className)}>
    {children}
  </DialogPrimitive.Title>
);

export const BottomSheetDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <DialogPrimitive.Description className={cn('text-sm text-muted-foreground mt-1', className)}>
    {children}
  </DialogPrimitive.Description>
);

export const BottomSheetBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)}>
    {children}
  </div>
);

export const BottomSheetFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t bg-muted/30', className)}>
    {children}
  </div>
);

// Hook for managing bottom sheet state
export const useBottomSheetState = (defaultOpen = false) => {
  const [open, setOpen] = React.useState(defaultOpen);

  const openSheet = React.useCallback(() => setOpen(true), []);
  const closeSheet = React.useCallback(() => setOpen(false), []);
  const toggleSheet = React.useCallback(() => setOpen(prev => !prev), []);

  return {
    open,
    setOpen,
    openSheet,
    closeSheet,
    toggleSheet,
  };
};

export default BottomSheet;
