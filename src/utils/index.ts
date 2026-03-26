import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateUUID(uuid: string) {
  if (!uuid) return '';
  return uuid.substring(0, 8);
}

export const statusColors: Record<string, string> = {
  // Baggage
  CHECKED_IN: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_TRANSIT: 'bg-blue-100 text-blue-700 border-blue-200',
  LOADING_TO_AIRCRAFT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  ARRIVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  LOST: 'bg-rose-100 text-rose-700 border-rose-200',
  DAMAGED: 'bg-orange-100 text-orange-700 border-orange-200',
  
  // Tracking
  SECURITY_CHECK: 'bg-amber-100 text-amber-700 border-amber-200',
  CUSTOMS_CHECK: 'bg-orange-100 text-orange-700 border-orange-200',
  READY_FOR_PICKUP: 'bg-teal-100 text-teal-700 border-teal-200',
  
  // Claims
  SUBMITTED: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
  DELAYED: 'bg-amber-100 text-amber-700 border-amber-200',
};
