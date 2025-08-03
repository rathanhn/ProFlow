'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/lib/haptic-feedback';

interface SwipeableTabsProps {
  children: React.ReactNode;
  className?: string;
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  startTime: number;
}

export const SwipeableTabsContainer: React.FC<SwipeableTabsProps> = ({ 
  children, 
  className 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const haptic = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    startTime: 0,
  });

  // Define tab order for different sections
  const getTabOrder = () => {
    if (pathname.startsWith('/admin')) {
      return [
        '/admin',
        '/admin/tasks',
        '/admin/clients',
        '/admin/more'
      ];
    } else if (pathname.startsWith('/client')) {
      const clientId = pathname.split('/')[2];
      return [
        `/client/${clientId}`,
        `/client/${clientId}/projects`,
        `/client/${clientId}/transactions`,
        `/client/${clientId}/settings`
      ];
    } else if (pathname.startsWith('/creator')) {
      const creatorId = pathname.split('/')[2];
      return [
        `/creator/${creatorId}`,
        `/creator/${creatorId}/tasks`,
        `/creator/${creatorId}/settings`
      ];
    }
    return [];
  };

  const getCurrentTabIndex = () => {
    const tabs = getTabOrder();
    const currentIndex = tabs.findIndex(tab => {
      if (tab === pathname) return true;
      // Handle nested routes
      if (pathname.startsWith(tab) && tab !== '/admin' && tab !== `/client/${pathname.split('/')[2]}` && tab !== `/creator/${pathname.split('/')[2]}`) {
        return true;
      }
      return false;
    });
    return currentIndex >= 0 ? currentIndex : 0;
  };

  const navigateToTab = (direction: 'left' | 'right') => {
    const tabs = getTabOrder();
    const currentIndex = getCurrentTabIndex();
    let newIndex = currentIndex;

    if (direction === 'left' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'right' && currentIndex < tabs.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex) {
      haptic.androidSwipeRefresh();
      router.push(tabs[newIndex]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true,
      startTime: Date.now(),
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState.isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;

    // Prevent vertical scrolling if horizontal swipe is detected
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }

    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));
  };

  const handleTouchEnd = () => {
    if (!swipeState.isDragging) return;

    const deltaX = swipeState.currentX - swipeState.startX;
    const deltaY = swipeState.currentY - swipeState.startY;
    const deltaTime = Date.now() - swipeState.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;

    // Determine if it's a valid swipe
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const isSignificantSwipe = Math.abs(deltaX) > 50 || velocity > 0.3;
    const isFastSwipe = deltaTime < 300;

    if (isHorizontalSwipe && isSignificantSwipe && isFastSwipe) {
      if (deltaX > 0) {
        // Swipe right - go to previous tab
        navigateToTab('left');
      } else {
        // Swipe left - go to next tab
        navigateToTab('right');
      }
    }

    setSwipeState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      startTime: 0,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setSwipeState({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: true,
      startTime: Date.now(),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!swipeState.isDragging) return;

    setSwipeState(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY,
    }));
  };

  const handleMouseUp = () => {
    if (!swipeState.isDragging) return;

    const deltaX = swipeState.currentX - swipeState.startX;
    const deltaY = swipeState.currentY - swipeState.startY;
    const deltaTime = Date.now() - swipeState.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const isSignificantSwipe = Math.abs(deltaX) > 100 || velocity > 0.5;
    const isFastSwipe = deltaTime < 500;

    if (isHorizontalSwipe && isSignificantSwipe && isFastSwipe) {
      if (deltaX > 0) {
        navigateToTab('left');
      } else {
        navigateToTab('right');
      }
    }

    setSwipeState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      startTime: 0,
    });
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateToTab('left');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateToTab('right');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden',
        swipeState.isDragging && 'select-none',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
      
      {/* Swipe Indicator */}
      {swipeState.isDragging && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="flex items-center gap-2 text-white text-xs">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <span>Swipe to navigate</span>
              <div className="w-2 h-2 rounded-full bg-white/60" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
