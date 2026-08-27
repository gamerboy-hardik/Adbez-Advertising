'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

const icons = {
  success: <CheckCircle2 size={16} className="text-emerald-500" />,
  error:   <AlertCircle  size={16} className="text-destructive" />,
  info:    <Info         size={16} className="text-primary" />,
};

const borders = {
  success: 'border-l-emerald-500',
  error:   'border-l-destructive',
  info:    'border-l-primary',
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.94 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{    opacity: 0, x: 40, scale: 0.94 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={[
              'pointer-events-auto flex items-center gap-3',
              'bg-card border border-border border-l-2 rounded-xl',
              'px-4 py-3 shadow-sm hover:shadow-md transition-shadow max-w-sm',
              borders[toast.type],
            ].join(' ')}
          >
            {icons[toast.type]}
            <span className="flex-1 text-xs text-foreground">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
