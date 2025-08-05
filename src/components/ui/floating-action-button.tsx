'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { Button } from '@/components/ui/button';
import { LucideIcon, Plus } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

const fabVariants = cva(
  'fixed z-50 rounded-full shadow-lg transition-all duration-200 ease-out active:scale-95 hover:shadow-xl pointer-events-auto flex items-center justify-center !p-0 [&_svg]:!size-auto',
  {
    variants: {
      size: {
        sm: 'h-12 w-12 min-h-12 min-w-12',
        default: 'h-14 w-14 min-h-14 min-w-14',
        lg: 'h-16 w-16 min-h-16 min-w-16',
      },
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success: 'bg-green-600 text-white hover:bg-green-700',
      },
      position: {
        'bottom-right': 'bottom-20 md:bottom-6 right-6 safe-area-pb',
        'bottom-left': 'bottom-20 md:bottom-6 left-6 safe-area-pb',
        'bottom-center': 'bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 safe-area-pb',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
      position: 'bottom-right',
    },
  }
);

interface FABAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'success';
}

interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon?: LucideIcon;
  actions?: FABAction[];
  extended?: boolean;
  label?: string;
  hideOnScroll?: boolean;
  scrollThreshold?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  className,
  size,
  variant,
  position,
  icon: Icon = Plus,
  actions = [],
  extended = false,
  label,
  hideOnScroll = false,
  scrollThreshold = 100,
  onClick,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const fabRef = React.useRef<HTMLButtonElement>(null);
  const haptic = useHapticFeedback();

  // Handle scroll visibility
  React.useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      if (scrollDifference > scrollThreshold) {
        setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, scrollThreshold, lastScrollY]);

  // Handle FAB gestures
  const gestures = useTouchGestures({
    onTap: () => {
      haptic.androidClick();
      if (actions.length > 0) {
        setIsExpanded(!isExpanded);
      } else {
        onClick?.({} as React.MouseEvent<HTMLButtonElement>);
      }
    },
    onLongPress: () => {
      haptic.androidLongPress();
      if (actions.length > 0) {
        setIsExpanded(true);
      }
    },
  }, {
    longPressDelay: 500,
  });

  React.useEffect(() => {
    const fab = fabRef.current;
    if (!fab) return;

    const cleanup = gestures.bindGestures(fab);
    return cleanup;
  }, [gestures]);

  // Close expanded FAB when clicking outside
  React.useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const handleActionClick = (action: FABAction) => {
    haptic.androidClick();
    action.onClick();
    setIsExpanded(false);
  };

  return (
    <>
      {/* Backdrop for expanded state */}
      {isExpanded && actions.length > 0 && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Action buttons */}
      {isExpanded && actions.length > 0 && (
        <div className="fixed z-50" style={{
          bottom: position?.includes('bottom') ? '7rem' : 'auto',
          top: position?.includes('top') ? '5rem' : 'auto',
          right: position?.includes('right') ? '1.5rem' : 'auto',
          left: position?.includes('left') ? '1.5rem' : 'auto',
        }}>
          <div className="flex flex-col gap-3">
            {actions.map((action, index) => (
              <div
                key={action.id}
                className="flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in-0"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                {position?.includes('right') && (
                  <span className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    {action.label}
                  </span>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    'h-12 w-12 min-h-12 min-w-12 rounded-full shadow-lg flex items-center justify-center !p-0 [&_svg]:!size-auto',
                    action.variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                    action.variant === 'success' && 'bg-green-600 text-white hover:bg-green-700',
                  )}
                  onClick={() => handleActionClick(action)}
                >
                  <action.icon className="!h-5 !w-5 !size-auto flex-shrink-0" />
                </Button>

                {position?.includes('left') && (
                  <span className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    {action.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main FAB */}
      <Button
        ref={fabRef}
        className={cn(
          fabVariants({ size, variant, position }),
          !isVisible && 'translate-y-20 opacity-0',
          isExpanded && actions.length > 0 && 'rotate-45',
          extended && 'px-6 rounded-full flex items-center justify-center',
          !extended && 'p-0',
          className
        )}
        onClick={actions.length === 0 ? onClick : undefined}
        {...props}
      >
        <Icon className={cn(
          size === 'sm' ? '!h-4 !w-4' : size === 'lg' ? '!h-7 !w-7' : '!h-5 !w-5',
          extended && label && 'mr-2',
          'flex-shrink-0 !size-auto'
        )} />
        {extended && label && (
          <span className="font-medium whitespace-nowrap">{label}</span>
        )}
      </Button>
    </>
  );
};

// Speed dial variant with predefined actions
export const SpeedDial: React.FC<{
  actions: FABAction[];
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'destructive' | 'success';
}> = ({ actions, ...props }) => {
  return (
    <FloatingActionButton
      actions={actions}
      {...props}
    />
  );
};

// Extended FAB with label
export const ExtendedFAB: React.FC<{
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'default' | 'secondary' | 'destructive' | 'success';
}> = ({ label, onClick, ...props }) => {
  return (
    <FloatingActionButton
      extended
      label={label}
      onClick={onClick}
      {...props}
    />
  );
};

export default FloatingActionButton;
