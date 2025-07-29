'use client';

import { useRef, useCallback, useEffect } from 'react';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureState {
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  deltaX: number;
  deltaY: number;
  distance: number;
  velocity: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  isActive: boolean;
  duration: number;
  startX: number;
  startY: number;
}

export interface GestureCallbacks {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', velocity: number, startX: number, startY: number, state: GestureState) => void;
  onSwipeLeft?: (state: GestureState) => void;
  onSwipeRight?: (state: GestureState) => void;
  onSwipeUp?: (state: GestureState) => void;
  onSwipeDown?: (state: GestureState) => void;
  onPan?: (state: GestureState) => void;
  onPanStart?: (state: GestureState) => void;
  onPanEnd?: (state: GestureState) => void;
  onTap?: (state: GestureState) => void;
  onLongPress?: (state: GestureState) => void;
  onPinch?: (scale: number, state: GestureState) => void;
}

export interface GestureOptions {
  swipeThreshold?: number;
  velocityThreshold?: number;
  longPressDelay?: number;
  tapMaxDistance?: number;
  preventScroll?: boolean;
  enablePinch?: boolean;
}

const defaultOptions: GestureOptions = {
  swipeThreshold: 50,
  velocityThreshold: 0.3,
  longPressDelay: 500,
  tapMaxDistance: 10,
  preventScroll: false,
  enablePinch: false,
};

export const useTouchGestures = (
  callbacks: GestureCallbacks,
  options: GestureOptions = {}
) => {
  const opts = { ...defaultOptions, ...options };
  const gestureState = useRef<GestureState>({
    startPoint: null,
    currentPoint: null,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    velocity: 0,
    direction: null,
    isActive: false,
    duration: 0,
    startX: 0,
    startY: 0,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTouchTime = useRef<number>(0);
  const initialPinchDistance = useRef<number>(0);

  const calculateDistance = (point1: TouchPoint, point2: TouchPoint): number => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  };

  const calculateVelocity = (distance: number, duration: number): number => {
    return duration > 0 ? distance / duration : 0;
  };

  const getDirection = (deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' | null => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else if (absY > absX) {
      return deltaY > 0 ? 'down' : 'up';
    }
    return null;
  };

  const getPinchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const updateGestureState = (currentPoint: TouchPoint) => {
    const state = gestureState.current;
    if (!state.startPoint) return;

    state.currentPoint = currentPoint;
    state.deltaX = currentPoint.x - state.startPoint.x;
    state.deltaY = currentPoint.y - state.startPoint.y;
    state.distance = calculateDistance(state.startPoint, currentPoint);
    state.duration = currentPoint.timestamp - state.startPoint.timestamp;
    state.velocity = calculateVelocity(state.distance, state.duration);
    state.direction = getDirection(state.deltaX, state.deltaY);
  };

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    const now = Date.now();
    
    const startPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now,
    };

    gestureState.current = {
      startPoint,
      currentPoint: startPoint,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      velocity: 0,
      direction: null,
      isActive: true,
      duration: 0,
      startX: touch.clientX,
      startY: touch.clientY,
    };

    // Handle pinch gesture
    if (opts.enablePinch && event.touches.length === 2) {
      initialPinchDistance.current = getPinchDistance(event.touches);
    }

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      if (gestureState.current.isActive && gestureState.current.distance < opts.tapMaxDistance!) {
        callbacks.onLongPress?.(gestureState.current);
      }
    }, opts.longPressDelay);

    callbacks.onPanStart?.(gestureState.current);
    lastTouchTime.current = now;

    if (opts.preventScroll) {
      event.preventDefault();
    }
  }, [callbacks, opts]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!gestureState.current.isActive || !gestureState.current.startPoint) return;

    const touch = event.touches[0];
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    updateGestureState(currentPoint);
    clearLongPressTimer();

    // Handle pinch gesture
    if (opts.enablePinch && event.touches.length === 2) {
      const currentPinchDistance = getPinchDistance(event.touches);
      if (initialPinchDistance.current > 0) {
        const scale = currentPinchDistance / initialPinchDistance.current;
        callbacks.onPinch?.(scale, gestureState.current);
      }
    }

    callbacks.onPan?.(gestureState.current);

    if (opts.preventScroll) {
      event.preventDefault();
    }
  }, [callbacks, opts]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!gestureState.current.isActive || !gestureState.current.startPoint) return;

    clearLongPressTimer();
    
    const state = gestureState.current;
    const { distance, velocity, direction, deltaX, deltaY } = state;

    // Check for tap
    if (distance < opts.tapMaxDistance! && state.duration < 300) {
      callbacks.onTap?.(state);
    }
    // Check for swipe
    else if (distance > opts.swipeThreshold! && velocity > opts.velocityThreshold!) {
      // Call general onSwipe callback first
      if (direction) {
        callbacks.onSwipe?.(direction, velocity, state.startX, state.startY, state);
      }

      switch (direction) {
        case 'left':
          callbacks.onSwipeLeft?.(state);
          break;
        case 'right':
          callbacks.onSwipeRight?.(state);
          break;
        case 'up':
          callbacks.onSwipeUp?.(state);
          break;
        case 'down':
          callbacks.onSwipeDown?.(state);
          break;
      }
    }

    callbacks.onPanEnd?.(state);

    // Reset state
    gestureState.current.isActive = false;
    initialPinchDistance.current = 0;

    if (opts.preventScroll) {
      event.preventDefault();
    }
  }, [callbacks, opts]);

  const bindGestures = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !opts.preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !opts.preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: !opts.preventScroll });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, opts.preventScroll]);

  return {
    bindGestures,
    gestureState: gestureState.current,
  };
};
