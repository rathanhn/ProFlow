'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  threshold?: number;
  className?: string;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className,
  refreshingText = 'Refreshing...',
  pullText = 'Pull to refresh',
  releaseText = 'Release to refresh',
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [canRefresh, setCanRefresh] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const haptic = useHapticFeedback();

  const handleRefresh = React.useCallback(async () => {
    if (disabled || isRefreshing) return;

    setIsRefreshing(true);
    haptic.androidSwipeRefresh();

    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
      haptic.error();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setCanRefresh(false);
    }
  }, [onRefresh, disabled, isRefreshing, haptic]);

  // Disable pull-to-refresh gesture handling to prevent scroll interference
  // Pull-to-refresh is temporarily disabled to ensure smooth scrolling
  React.useEffect(() => {
    // This effect is intentionally empty - pull-to-refresh is disabled
    // to prevent interference with normal scrolling behavior
  }, []);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const iconRotation = pullProgress * 180;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        className
      )}
      style={{
        transform: isRefreshing ? `translateY(${threshold}px)` : `translateY(${pullDistance}px)`,
        transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center bg-background/95 backdrop-blur-sm border-b transition-all duration-300',
          'text-sm text-muted-foreground',
          pullDistance > 0 || isRefreshing ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? threshold : 0)}px`,
          transform: `translateY(-${Math.max(pullDistance, isRefreshing ? threshold : 0)}px)`,
        }}
      >
        <div className="flex items-center gap-2">
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{refreshingText}</span>
            </>
          ) : (
            <>
              <ArrowDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  canRefresh && 'rotate-180'
                )}
                style={{
                  transform: `rotate(${canRefresh ? 180 : iconRotation}deg)`,
                }}
              />
              <span>{canRefresh ? releaseText : pullText}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-full">
        {children}
      </div>
    </div>
  );
};

// Hook for easier usage
export const usePullToRefresh = (
  onRefresh: () => Promise<void> | void,
  options?: {
    disabled?: boolean;
    threshold?: number;
  }
) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const haptic = useHapticFeedback();

  const refresh = React.useCallback(async () => {
    if (options?.disabled || isRefreshing) return;

    setIsRefreshing(true);
    haptic.androidSwipeRefresh();

    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
      haptic.error();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, options?.disabled, isRefreshing, haptic]);

  return {
    isRefreshing,
    refresh,
  };
};

export default PullToRefresh;
