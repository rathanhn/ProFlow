'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface LongPressAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'secondary';
}

interface LongPressMenuProps {
  children: React.ReactNode;
  actions: LongPressAction[];
  disabled?: boolean;
  delay?: number;
  className?: string;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

export const LongPressMenu: React.FC<LongPressMenuProps> = ({
  children,
  actions,
  disabled = false,
  delay = 500,
  className,
  onLongPressStart,
  onLongPressEnd,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [pressProgress, setPressProgress] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const haptic = useHapticFeedback();
  const progressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const closeMenu = React.useCallback(() => {
    setIsMenuOpen(false);
    setPressProgress(0);
    onLongPressEnd?.();
  }, [onLongPressEnd]);

  const calculateMenuPosition = (x: number, y: number): ContextMenuPosition => {
    const menuWidth = 200;
    const menuHeight = actions.length * 48 + 16; // Approximate height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth;
    }

    // Adjust vertical position
    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight;
    }

    return { x: Math.max(8, adjustedX), y: Math.max(8, adjustedY) };
  };

  const gestures = useTouchGestures({
    onPanStart: (state) => {
      if (disabled) return;
      
      onLongPressStart?.();
      setPressProgress(0);
      
      // Start progress animation
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / delay, 1);
        setPressProgress(progress);
        
        if (progress < 1) {
          progressTimer.current = setTimeout(updateProgress, 16); // ~60fps
        }
      };
      updateProgress();
    },
    onPanEnd: () => {
      if (progressTimer.current) {
        clearTimeout(progressTimer.current);
        progressTimer.current = null;
      }
      setPressProgress(0);
    },
    onLongPress: (state) => {
      if (disabled) return;
      
      haptic.androidLongPress();
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && state.startPoint) {
        const position = calculateMenuPosition(
          state.startPoint.x,
          state.startPoint.y
        );
        setMenuPosition(position);
        setIsMenuOpen(true);
      }
    },
  }, {
    longPressDelay: delay,
  });

  // Temporarily disable long press gestures to prevent scroll interference
  React.useEffect(() => {
    // Long press gestures are temporarily disabled to ensure smooth scrolling
  }, []);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-long-press-menu]')) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, closeMenu]);

  const handleActionClick = (action: LongPressAction) => {
    haptic.androidClick();
    action.onClick();
    closeMenu();
  };

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'relative select-none',
          pressProgress > 0 && 'bg-muted/50 rounded-md',
          className
        )}
        style={{
          transition: pressProgress > 0 ? 'background-color 0.1s ease' : 'none',
        }}
      >
        {children}
        
        {/* Progress indicator */}
        {pressProgress > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-primary/20 rounded-md transition-all duration-75 ease-out"
              style={{
                transform: `scale(${0.95 + (pressProgress * 0.05)})`,
                opacity: pressProgress,
              }}
            />
            <div
              className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-md transition-all duration-75 ease-out"
              style={{
                width: `${pressProgress * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Context Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-transparent"
            onClick={closeMenu}
          />
          
          {/* Menu */}
          <div
            data-long-press-menu
            className="fixed z-50 min-w-[200px] bg-background border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95"
            style={{
              left: menuPosition.x,
              top: menuPosition.y,
            }}
          >
            <div className="py-2">
              {actions.map((action, index) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-3 px-4 py-3 h-auto font-normal',
                    action.variant === 'destructive' && 'text-destructive hover:text-destructive',
                    index === 0 && 'rounded-t-lg',
                    index === actions.length - 1 && 'rounded-b-lg'
                  )}
                  onClick={() => handleActionClick(action)}
                >
                  {action.icon && <action.icon className="h-4 w-4" />}
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Hook for managing long press state
export const useLongPress = (
  onLongPress: () => void,
  options: {
    delay?: number;
    disabled?: boolean;
  } = {}
) => {
  const { delay = 500, disabled = false } = options;
  const haptic = useHapticFeedback();

  const gestures = useTouchGestures({
    onLongPress: () => {
      if (!disabled) {
        haptic.androidLongPress();
        onLongPress();
      }
    },
  }, {
    longPressDelay: delay,
  });

  return gestures.bindGestures;
};

// Simple long press wrapper component
export const LongPressWrapper: React.FC<{
  children: React.ReactNode;
  onLongPress: () => void;
  delay?: number;
  disabled?: boolean;
  className?: string;
  showProgress?: boolean;
}> = ({
  children,
  onLongPress,
  delay = 500,
  disabled = false,
  className,
  showProgress = true,
}) => {
  const [pressProgress, setPressProgress] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const haptic = useHapticFeedback();
  const progressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const gestures = useTouchGestures({
    onPanStart: () => {
      if (disabled || !showProgress) return;
      
      setPressProgress(0);
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / delay, 1);
        setPressProgress(progress);
        
        if (progress < 1) {
          progressTimer.current = setTimeout(updateProgress, 16);
        }
      };
      updateProgress();
    },
    onPanEnd: () => {
      if (progressTimer.current) {
        clearTimeout(progressTimer.current);
        progressTimer.current = null;
      }
      setPressProgress(0);
    },
    onLongPress: () => {
      if (!disabled) {
        haptic.androidLongPress();
        onLongPress();
      }
    },
  }, {
    longPressDelay: delay,
  });

  // Temporarily disable long press wrapper gestures to prevent scroll interference
  React.useEffect(() => {
    // Long press wrapper gestures are temporarily disabled to ensure smooth scrolling
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative select-none',
        pressProgress > 0 && showProgress && 'bg-muted/30 rounded-md',
        className
      )}
    >
      {children}
      
      {/* Progress indicator */}
      {showProgress && pressProgress > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-md transition-all duration-75 ease-out"
            style={{
              width: `${pressProgress * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LongPressMenu;
