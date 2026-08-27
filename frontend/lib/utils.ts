import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

export function truncateId(id?: string | null, chars = 8): string {
  if (!id || typeof id !== 'string') return '-';
  return id.substring(0, chars).toUpperCase();
}

export function getPlatformColor(platform: string): string {
  const map: Record<string, string> = {
    META:   'blue',
    GOOGLE: 'amber',
    TIKTOK: 'pink',
    BING:   'sky',
  };
  return map[platform?.toUpperCase()] || 'slate';
}
