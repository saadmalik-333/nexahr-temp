import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateEmployeeId(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const paddedNumber = String(sequenceNumber).padStart(4, '0');
  return `NHR-${year}-${paddedNumber}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'badge-pending';
    case 'approved':
      return 'badge-approved';
    case 'declined':
      return 'badge-declined';
    case 'terminated':
      return 'badge-terminated';
    default:
      return 'badge';
  }
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getAttendanceColor(status: string): string {
  switch (status) {
    case 'present':
      return '#10b981';
    case 'absent':
      return '#ef4444';
    case 'late':
      return '#f59e0b';
    case 'half-day':
      return '#f97316';
    default:
      return '#374151';
  }
}

export function getRecommendationColor(rec: string): string {
  switch (rec) {
    case 'strong':
      return 'text-success';
    case 'average':
      return 'text-warning';
    case 'weak':
      return 'text-danger';
    default:
      return 'text-text-secondary';
  }
}
