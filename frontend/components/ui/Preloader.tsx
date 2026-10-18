'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Preloader({ fullScreen = true, text }: { fullScreen?: boolean; text?: string } = {}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only show for initial load — quick, smooth, luxury timing (650ms)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.98,
            transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } 
          }}
          className={`z-[99999] bg-background flex flex-col items-center justify-center overflow-hidden ${
            fullScreen ? 'fixed inset-0' : 'fixed inset-0'
          }`}
        >
          {/* Ambient center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Luxury Monogram Badge */}
          <div className="relative mb-8">
            {/* Spinning orbital border ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="absolute -inset-2.5 rounded-3xl border border-[var(--accent)]/30 border-t-[var(--accent)] pointer-events-none"
            />
            
            {/* Inner Brand Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-20 h-20 rounded-2xl bg-card border border-border shadow-2xl flex flex-col items-center justify-center relative z-10"
            >
              <span className="font-['Outfit'] font-black text-2xl tracking-tighter bg-gradient-to-br from-[var(--accent)] to-cyan-400 bg-clip-text text-transparent">
                AB
              </span>
              <span className="text-[7px] font-bold tracking-[0.25em] uppercase text-muted-foreground -mt-0.5">
                ADBEZ
              </span>
            </motion.div>
          </div>

          {/* Fluid Progress Line */}
          <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden relative mb-4">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[var(--accent)] to-cyan-400 rounded-full"
            />
          </div>

          {/* Status Label */}
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="text-[11px] tracking-[0.2em] font-bold text-muted-foreground uppercase m-0 font-['Space_Grotesk']"
          >
            {text || 'Securing Node Connection...'}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
