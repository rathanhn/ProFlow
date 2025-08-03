import React from 'react';
import { cn } from '@/lib/utils';

interface INRIconProps {
  className?: string;
  size?: number;
}

export const INRIcon: React.FC<INRIconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-indian-rupee", className)}
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </svg>
  );
};

// Alternative simpler INR icon
export const SimpleINRIcon: React.FC<INRIconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-rupee", className)}
    >
      <path d="M7 4h10" />
      <path d="M7 8h8" />
      <path d="M7 12h3" />
      <path d="M10 12c4 0 4-6 0-6" />
      <path d="m7 16 6 6" />
    </svg>
  );
};

// Text-based INR symbol (most accurate)
export const INRSymbol: React.FC<INRIconProps> = ({ className, size = 24 }) => {
  return (
    <div 
      className={cn("flex items-center justify-center font-bold", className)}
      style={{ 
        width: size, 
        height: size, 
        fontSize: size * 0.7,
        lineHeight: 1
      }}
    >
      ₹
    </div>
  );
};

// Default export - use the most appropriate one
export default INRIcon;
