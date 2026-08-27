'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-md', className }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-md z-[300]"
          />

          {/* Modal Box */}
          <div className="fixed inset-0 z-[301] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className={cn(
                'w-full pointer-events-auto',
                'bg-card border border-border rounded-2xl shadow-lg',
                'relative overflow-hidden',
                maxWidth,
                className
              )}
            >
              {/* Top accent gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--accent)] via-cyan-400 to-[var(--accent)]" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-card-hover transition-all hover:scale-110"
              >
                <X size={14} />
              </button>

              {/* Header */}
              {(title || subtitle) && (
                <div className="px-6 pt-6 pb-0 mb-5">
                  {title && (
                    <h3 className="font-display text-base font-bold text-foreground tracking-tight mb-1">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="px-6 pb-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
