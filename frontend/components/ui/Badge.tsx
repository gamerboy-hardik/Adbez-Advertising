import { cn } from '@/lib/utils';
import type { AccountStatus, PaymentStatus } from '@/types';

type BadgeVariant = AccountStatus | PaymentStatus | 'admin' | 'anomaly' | 'vpn';

const variants: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  SOLD:      'bg-rose-500/10    text-rose-600    dark:text-rose-400    border-rose-500/20',
  RESERVED:  'bg-amber-500/10   text-amber-600   dark:text-amber-400   border-amber-500/20',
  PENDING:   'bg-amber-500/10   text-amber-600   dark:text-amber-400   border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  FLAGGED:   'bg-rose-500/10    text-rose-600    dark:text-rose-400    border-rose-500/20',
  REFUNDED:  'bg-violet-500/10  text-violet-600  dark:text-violet-400  border-violet-500/20',
  admin:     'bg-primary/10     text-primary                           border-primary/20',
  anomaly:   'bg-destructive/15 text-destructive                       border-destructive/30',
  vpn:       'bg-amber-500/10   text-amber-600   dark:text-amber-400   border-amber-500/20',
};

interface BadgeProps {
  variant: BadgeVariant | string;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  const classes = variants[variant] || 'bg-muted text-muted-foreground border-border';
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase',
      'px-2 py-0.5 rounded-full border',
      classes,
      className
    )}>
      {children}
    </span>
  );
}
