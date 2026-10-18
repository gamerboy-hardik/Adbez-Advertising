'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-border/50 bg-card/50" />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300 ${
        isDark 
          ? 'bg-card border-white/10 text-amber-300 hover:border-[var(--accent)] hover:text-amber-200 shadow-sm' 
          : 'bg-card border-black/10 text-indigo-600 hover:border-indigo-400 hover:text-indigo-700 shadow-sm'
      }`}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Clean White Theme" : "Switch to Pure Obsidian Dark Theme"}
    >
      <motion.div
        key={isDark ? 'dark-mode' : 'light-mode'}
        initial={{ rotate: -40, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 40, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.div>
    </motion.button>
  );
}
