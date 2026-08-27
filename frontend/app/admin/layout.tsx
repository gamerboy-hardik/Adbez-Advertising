'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Receipt, Fingerprint, Users, Shield, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Dashboard'          },
  { href: '/admin/inventory',    icon: Package,         label: 'Inventory Control'  },
  { href: '/admin/transactions', icon: Receipt,         label: 'Transaction Ledger' },
  { href: '/admin/footprint',    icon: Fingerprint,     label: 'Footprint Monitor'  },
  { href: '/admin/users',        icon: Users,           label: 'User Management'    },
];

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, type: 'spring' as const, stiffness: 120, damping: 14 }
  })
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore() as any;
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setChecking(false);
  }, []);

  // Auth gate
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <motion.div 
          className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!isAuthenticated() || !isAdmin()) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-md z-[500] flex items-center justify-center p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="glass-card w-full max-w-sm p-8 shadow-md rounded-2xl"
        >
          <motion.div 
            className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-5"
            animate={{ boxShadow: ['0 0 0 0 rgba(0,229,255,0.2)', '0 0 0 12px rgba(0,229,255,0)', '0 0 0 0 rgba(0,229,255,0.2)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Shield size={20} className="text-primary" />
          </motion.div>
          <h2 className="font-['Outfit'] text-lg font-bold text-foreground mb-1">
            Restricted Operations Zone
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Administrator credentials required to access the control matrix.
          </p>
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 bg-gradient-to-r from-[var(--accent)] to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-glow"
          >
            Return to Marketplace
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Admin Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-background/60 backdrop-blur-sm sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar py-5 px-3">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground px-3 mb-4"
        >
          Control Matrix
        </motion.p>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, icon: Icon, label }, i) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <motion.div
                key={href}
                custom={i}
                variants={sidebarItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border-l-2 text-xs font-medium group overflow-hidden',
                    isActive
                      ? 'border-primary bg-primary/[0.06] text-foreground'
                      : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-primary/[0.03]'
                  )}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-[var(--accent)]/5 to-transparent" />
                  <Icon size={13} className={cn(
                    'transition-colors relative z-10',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-[var(--accent)]'
                  )} />
                  <span className="relative z-10">{label}</span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-dot"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                      style={{ boxShadow: '0 0 8px rgba(0,229,255,0.6)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Admin User */}
        <motion.div 
          className="absolute bottom-4 left-3 right-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-card rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield size={12} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-foreground truncate">{user?.email}</p>
              <p className="text-[9px] text-muted-foreground">Admin</p>
            </div>
            <motion.button 
              onClick={logout} 
              whileHover={{ scale: 1.1, color: '#f87171' }}
              whileTap={{ scale: 0.9 }}
              className="text-muted-foreground transition-colors"
            >
              <LogOut size={12} />
            </motion.button>
          </div>
        </motion.div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 p-4 md:p-7 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
