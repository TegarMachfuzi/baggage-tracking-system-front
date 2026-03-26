import React from 'react';
import { cn, statusColors } from '@/src/utils';

interface BadgeProps {
  status: string;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ status, children, className }: BadgeProps) {
  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      colorClass,
      className
    )}>
      {children || status.replace(/_/g, ' ')}
    </span>
  );
}
