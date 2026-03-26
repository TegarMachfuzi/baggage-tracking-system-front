import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/src/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <Loader2 
      size={size} 
      className={cn("animate-spin text-blue-500", className)} 
    />
  );
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
      <Spinner size={32} />
    </div>
  );
}
