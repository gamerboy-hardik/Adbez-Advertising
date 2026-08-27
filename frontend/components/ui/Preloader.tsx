'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide preloader after 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] bg-[#030712] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Staggered Logo Animation */}
          <div className="flex items-center gap-8 mb-12">
            {/* Meta */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
              className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.17 14.36h-1.63v-3.79c0-.98-.79-1.78-1.78-1.78-.98 0-1.78.79-1.78 1.78v3.79H8.35v-8.2h1.63v1.17c.52-.77 1.34-1.28 2.27-1.28 1.63 0 2.94 1.31 2.94 2.94v5.37z" fill="#0668E1"/>
              </svg>
            </motion.div>

            {/* Google Ads */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
              className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.53 14.53L10.5 12.5l-1.03 2.03-2.03 1.03 2.03 1.03 1.03 2.03 1.03-2.03 2.03-1.03-2.03-1.03zm7.62-5.41L17.5 6.5l-1.65 2.62-2.62 1.65 2.62 1.65 1.65 2.62 1.65-2.62 2.62-1.65-2.62-1.65zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#F4B400"/>
              </svg>
            </motion.div>

            {/* TikTok */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
              className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.95-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.13-3.92-5.3-.4-1.84-.13-3.8.77-5.46 1.47-2.66 4.38-4.44 7.45-4.52.01 1.48 0 2.96.01 4.45-.88.08-1.74.33-2.48.86-.71.53-1.18 1.34-1.35 2.2-.18 1.05.08 2.14.7 2.96.65.86 1.7 1.37 2.78 1.42 1.03.04 2.05-.33 2.78-1.04.68-.69 1.1-1.63 1.16-2.61.02-5.32 0-10.63.01-15.95h.02z" fill="#818CF8"/>
              </svg>
            </motion.div>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 250 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-xs tracking-[0.2em] font-bold text-muted-foreground uppercase"
          >
            Initializing AdBez Node
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
