'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

export interface SwipeAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: 'destructive' | 'success' | 'warning' | 'primary' | 'secondary';
  onAction: () => void | Promise<void>;
}

interface SwipeActionItemProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  disabled?: boolean;
  threshold?: number;
  className?: string;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

const actionColorClasses = {
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  success: 'bg-green-600 text-white hover:bg-green-700',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
};

export const SwipeActionItem: React.FC<SwipeActionItemProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  disabled = false,
  threshold = 80,
  className,
  onSwipeStart,
  onSwipeEnd,
}) => {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [activeActions, setActiveActions] = React.useState<SwipeAction[]>([]);
  const [isActionTriggered, setIsActionTriggered] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const haptic = useHapticFeedback();

  const resetSwipe = React.useCallback(() => {
    setSwipeOffset(0);
    setActiveActions([]);
    setIsActionTriggered(false);
    onSwipeEnd?.();
  }, [onSwipeEnd]);

  const executeAction = React.useCallback(async (action: SwipeAction) => {
    if (isActionTriggered) return;
    
    setIsActionTriggered(true);
    haptic.androidClick();

    try {
      await action.onAction();
    } catch (error) {
      console.error('Action failed:', error);
      haptic.error();
    }

    // Reset after a short delay to show feedback
    setTimeout(resetSwipe, 150);
  }, [isActionTriggered, haptic, resetSwipe]);

  const gestures = useTouchGestures({
    onPanStart: (state) => {
      if (disabled) return;
      onSwipeStart?.();
    },
    onPan: (state) => {
      if (disabled || isActionTriggered) return;

      const { deltaX, direction } = state;
      const maxSwipe = threshold * 2;
      
      // Determine which actions to show based on swipe direction
      let actions: SwipeAction[] = [];
      let offset = 0;

      if (direction === 'right' && leftActions.length > 0) {
        actions = leftActions;
        offset = Math.min(Math.max(deltaX, 0), maxSwipe);
      } else if (direction === 'left' && rightActions.length > 0) {
        actions = rightActions;
        offset = Math.max(Math.min(deltaX, 0), -maxSwipe);
      }

      setSwipeOffset(offset);
      setActiveActions(actions);

      // Haptic feedback when reaching threshold
      const absOffset = Math.abs(offset);
      if (absOffset >= threshold && absOffset < threshold + 10) {
        haptic.selection();
      }
    },
    onPanEnd: (state) => {
      if (disabled || isActionTriggered) return;

      const { deltaX, velocity, direction } = state;
      const absOffset = Math.abs(deltaX);
      const shouldTrigger = absOffset >= threshold || (Math.abs(velocity) > 0.5 && absOffset > 40);

      if (shouldTrigger && activeActions.length > 0) {
        // For now, trigger the first action. Could be enhanced to select based on swipe distance
        executeAction(activeActions[0]);
      } else {
        resetSwipe();
      }
    },
  }, {
    swipeThreshold: 20,
    velocityThreshold: 0.3,
    preventScroll: false,
  });

  // Temporarily disable swipe gestures to prevent scroll interference
  React.useEffect(() => {
    // Swipe actions are temporarily disabled to ensure smooth scrolling
  }, []);

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null;

    const isVisible = side === 'left' ? swipeOffset > 0 : swipeOffset < 0;
    const actionWidth = threshold;

    return (
      <div
        className={cn(
          'absolute top-0 bottom-0 flex items-center',
          side === 'left' ? 'left-0' : 'right-0',
          !isVisible && 'opacity-0'
        )}
        style={{
          width: `${Math.abs(swipeOffset)}px`,
          [side]: side === 'left' ? `-${Math.abs(swipeOffset)}px` : `-${Math.abs(swipeOffset)}px`,
        }}
      >
        {actions.map((action, index) => (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            className={cn(
              'h-full rounded-none flex-col gap-1 px-3 min-w-0 flex-1',
              actionColorClasses[action.color],
              Math.abs(swipeOffset) >= threshold && 'animate-pulse'
            )}
            onClick={() => executeAction(action)}
            disabled={isActionTriggered}
          >
            <action.icon className="h-4 w-4" />
            <span className="text-xs truncate">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-background touch-pan-y',
        className
      )}
    >
      {/* Left actions */}
      {renderActions(leftActions, 'left')}
      
      {/* Right actions */}
      {renderActions(rightActions, 'right')}

      {/* Main content */}
      <div
        ref={contentRef}
        className={cn(
          'relative z-10 bg-background transition-transform',
          isActionTriggered ? 'duration-150' : 'duration-0'
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Hook for managing swipe actions
export const useSwipeActions = () => {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  const closeAll = React.useCallback(() => {
    setActiveItem(null);
  }, []);

  const setActive = React.useCallback((itemId: string) => {
    setActiveItem(itemId);
  }, []);

  return {
    activeItem,
    setActive,
    closeAll,
  };
};

export default SwipeActionItem;
