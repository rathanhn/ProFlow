'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RippleProps {
  x: number;
  y: number;
  size: number;
  color?: string;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  color?: string;
  duration?: number;
}

const Ripple: React.FC<RippleProps & { onComplete: () => void; duration: number }> = ({
  x,
  y,
  size,
  color = 'rgba(255, 255, 255, 0.6)',
  onComplete,
  duration,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  return (
    <span
      className="absolute rounded-full pointer-events-none animate-android-ripple"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
        animationDuration: `${duration}ms`,
      }}
    />
  );
};

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className,
  disabled = false,
  color,
  duration = 600,
}) => {
  const [ripples, setRipples] = React.useState<Array<RippleProps & { id: number }>>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const nextRippleId = React.useRef(0);

  const createRipple = React.useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Calculate ripple size based on distance to furthest corner
    const size = Math.max(
      Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
      Math.sqrt(Math.pow(rect.width - x, 2) + Math.pow(y, 2)),
      Math.sqrt(Math.pow(x, 2) + Math.pow(rect.height - y, 2)),
      Math.sqrt(Math.pow(rect.width - x, 2) + Math.pow(rect.height - y, 2))
    ) * 2;

    const ripple = {
      id: nextRippleId.current++,
      x,
      y,
      size,
      color,
    };

    setRipples(prev => [...prev, ripple]);
  }, [disabled, color]);

  const removeRipple = React.useCallback((id: number) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseDown={createRipple}
      onTouchStart={createRipple}
    >
      {children}
      {ripples.map(ripple => (
        <Ripple
          key={ripple.id}
          {...ripple}
          duration={duration}
          onComplete={() => removeRipple(ripple.id)}
        />
      ))}
    </div>
  );
};

// Enhanced Button with ripple effect
export const RippleButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    rippleColor?: string;
    rippleDuration?: number;
  }
> = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  rippleColor,
  rippleDuration = 600,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const defaultRippleColor = variant === 'default' || variant === 'destructive' 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(0, 0, 0, 0.1)';

  return (
    <RippleEffect
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      color={rippleColor || defaultRippleColor}
      duration={rippleDuration}
      disabled={disabled}
    >
      <button {...props} disabled={disabled} className="w-full h-full flex items-center justify-center">
        {children}
      </button>
    </RippleEffect>
  );
};

// Hook for adding ripple effect to any element
export const useRippleEffect = (
  options: {
    color?: string;
    duration?: number;
    disabled?: boolean;
  } = {}
) => {
  const { color, duration = 600, disabled = false } = options;
  const [ripples, setRipples] = React.useState<Array<RippleProps & { id: number }>>([]);
  const nextRippleId = React.useRef(0);

  const createRipple = React.useCallback((
    event: MouseEvent | TouchEvent,
    element: HTMLElement
  ) => {
    if (disabled) return;

    const rect = element.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const size = Math.max(
      Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
      Math.sqrt(Math.pow(rect.width - x, 2) + Math.pow(y, 2)),
      Math.sqrt(Math.pow(x, 2) + Math.pow(rect.height - y, 2)),
      Math.sqrt(Math.pow(rect.width - x, 2) + Math.pow(rect.height - y, 2))
    ) * 2;

    const ripple = {
      id: nextRippleId.current++,
      x,
      y,
      size,
      color,
    };

    setRipples(prev => [...prev, ripple]);
  }, [disabled, color]);

  const removeRipple = React.useCallback((id: number) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  }, []);

  const bindRipple = React.useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const handleInteraction = (event: MouseEvent | TouchEvent) => {
      createRipple(event, element);
    };

    element.addEventListener('mousedown', handleInteraction);
    element.addEventListener('touchstart', handleInteraction);

    return () => {
      element.removeEventListener('mousedown', handleInteraction);
      element.removeEventListener('touchstart', handleInteraction);
    };
  }, [createRipple]);

  const RippleContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
  }) => (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      {ripples.map(ripple => (
        <Ripple
          key={ripple.id}
          {...ripple}
          duration={duration}
          onComplete={() => removeRipple(ripple.id)}
        />
      ))}
    </div>
  );

  return {
    bindRipple,
    RippleContainer,
    ripples,
  };
};

export default RippleEffect;
