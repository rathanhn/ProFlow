'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useHapticFeedback } from '@/lib/haptic-feedback';
import { RippleEffect } from '@/components/ui/ripple-effect';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  disabled?: boolean;
}

interface MobileTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  showLabels?: boolean;
  variant?: 'default' | 'filled' | 'pills';
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  showLabels = true,
  variant = 'default',
}) => {
  const haptic = useHapticFeedback();
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const tabBarRef = React.useRef<HTMLDivElement>(null);

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  // Handle swipe gestures for tab navigation
  const gestures = useTouchGestures({
    onSwipeLeft: () => {
      const nextIndex = Math.min(activeIndex + 1, tabs.length - 1);
      if (nextIndex !== activeIndex && !tabs[nextIndex].disabled) {
        onTabChange(tabs[nextIndex].id);
        haptic.selection();
      }
    },
    onSwipeRight: () => {
      const prevIndex = Math.max(activeIndex - 1, 0);
      if (prevIndex !== activeIndex && !tabs[prevIndex].disabled) {
        onTabChange(tabs[prevIndex].id);
        haptic.selection();
      }
    },
    onPan: (state) => {
      if (Math.abs(state.deltaX) > 20) {
        setSwipeOffset(state.deltaX * 0.1); // Damped movement
      }
    },
    onPanEnd: () => {
      setSwipeOffset(0);
    },
  }, {
    swipeThreshold: 50,
    velocityThreshold: 0.3,
  });

  React.useEffect(() => {
    const tabBar = tabBarRef.current;
    if (!tabBar) return;

    const cleanup = gestures.bindGestures(tabBar);
    return cleanup;
  }, [gestures]);

  const handleTabClick = (tab: TabItem) => {
    if (tab.disabled) return;
    
    haptic.androidClick();
    onTabChange(tab.id);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return 'bg-muted/50 backdrop-blur-sm';
      case 'pills':
        return 'bg-background border-t';
      default:
        return 'bg-background/95 backdrop-blur-sm border-t';
    }
  };

  return (
    <div
      ref={tabBarRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 safe-area-pb',
        getVariantClasses(),
        className
      )}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <RippleEffect
              key={tab.id}
              className={cn(
                'flex-1 max-w-[80px] relative',
                tab.disabled && 'opacity-50 pointer-events-none'
              )}
              color={isActive ? 'rgba(var(--primary), 0.2)' : 'rgba(0, 0, 0, 0.1)'}
            >
              <button
                className={cn(
                  'w-full flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200',
                  'min-h-[48px] touch-manipulation',
                  isActive && variant === 'pills' && 'bg-primary text-primary-foreground',
                  isActive && variant === 'filled' && 'bg-primary/10 text-primary',
                  isActive && variant === 'default' && 'text-primary',
                  !isActive && 'text-muted-foreground hover:text-foreground',
                  'active:scale-95'
                )}
                onClick={() => handleTabClick(tab)}
                disabled={tab.disabled}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      isActive && 'scale-110'
                    )} 
                  />
                  {tab.badge && tab.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-[16px] animate-android-bounce"
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Badge>
                  )}
                </div>
                {showLabels && (
                  <span 
                    className={cn(
                      'text-xs mt-1 transition-all duration-200 leading-tight',
                      isActive ? 'font-medium' : 'font-normal'
                    )}
                  >
                    {tab.label}
                  </span>
                )}
              </button>
            </RippleEffect>
          );
        })}
      </div>

      {/* Active indicator for default variant */}
      {variant === 'default' && (
        <div
          className="absolute top-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-android-standard"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      )}
    </div>
  );
};

// Gesture-based navigation component
export const GestureNavigation: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
}) => {
  const haptic = useHapticFeedback();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const gestures = useTouchGestures({
    onSwipeLeft: (state) => {
      if (onSwipeLeft && state.velocity > 0.5) {
        haptic.selection();
        onSwipeLeft();
      }
    },
    onSwipeRight: (state) => {
      if (onSwipeRight && state.velocity > 0.5) {
        haptic.selection();
        onSwipeRight();
      }
    },
    onSwipeUp: (state) => {
      if (onSwipeUp && state.velocity > 0.5) {
        haptic.selection();
        onSwipeUp();
      }
    },
    onSwipeDown: (state) => {
      if (onSwipeDown && state.velocity > 0.5) {
        haptic.selection();
        onSwipeDown();
      }
    },
  }, {
    swipeThreshold: 80,
    velocityThreshold: 0.5,
  });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanup = gestures.bindGestures(container);
    return cleanup;
  }, [gestures]);

  return (
    <div ref={containerRef} className={cn('h-full', className)}>
      {children}
    </div>
  );
};

// Hook for managing mobile navigation state
export const useMobileNavigation = (initialTab: string) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [isTabBarVisible, setIsTabBarVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  // Auto-hide tab bar on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;

      if (Math.abs(scrollDifference) > 10) {
        setIsTabBarVisible(scrollDifference < 0 || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const showTabBar = () => setIsTabBarVisible(true);
  const hideTabBar = () => setIsTabBarVisible(false);

  return {
    activeTab,
    setActiveTab,
    isTabBarVisible,
    showTabBar,
    hideTabBar,
  };
};

export default MobileTabBar;
