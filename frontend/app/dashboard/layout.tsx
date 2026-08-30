'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Wallet, MonitorSmartphone, Globe, Video, Share2, Search,
  BookOpen, ChevronRight, Sparkles, UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, cn } from '@/lib/utils';

const agencyNavItems = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard',         color: 'text-primary' },
  { href: '/dashboard/wallet',   icon: Wallet,          label: 'Wallet & Ledgers',  color: 'text-emerald-400' },
  { type: 'divider', label: 'Platforms' },
  { href: '/dashboard/meta',     icon: MonitorSmartphone,label: 'Facebook (Meta)',   color: 'text-blue-400' },
  { href: '/dashboard/google',   icon: Globe,           label: 'Google Ads MCC',    color: 'text-amber-400' },
  { href: '/dashboard/tiktok',   icon: Video,           label: 'TikTok Business',   color: 'text-pink-400' },
  { href: '/dashboard/snapchat', icon: Share2,          label: 'Snapchat Agency',   color: 'text-yellow-300' },
  { href: '/dashboard/bing',     icon: Search,          label: 'Bing Ads VIP',      color: 'text-sky-400' },
  { type: 'divider', label: 'Knowledge' },
  { href: '/dashboard/guide',    icon: BookOpen,        label: 'Interactive Guide', color: 'text-violet-400' },
];

export default function AgencyDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuthStore() as any;
  const balance = user?.walletBalance ?? 0;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Checking credentials...</div>;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0 border-r border-border/50 bg-card/90 backdrop-blur-md sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar py-6 px-4 flex flex-col justify-between shadow-md z-20">
        <div>
          {/* Brand header in sidebar */}
          <div className="flex items-center gap-2.5 px-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center font-['Space_Grotesk'] font-black text-white text-sm shadow-lg shadow-primary/30">
              A
            </div>
            <div>
              <p className="font-['Space_Grotesk'] font-bold text-sm text-foreground tracking-tight leading-none">AdBez Agency</p>
              <p className="text-[10px] text-primary font-semibold mt-0.5">Media Buyer Matrix</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1">
            {agencyNavItems.map((item, i) => {
              if (item.type === 'divider') {
                return (
                  <p key={item.label} className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60 px-3 pt-4 pb-1.5">
                    {item.label}
                  </p>
                );
              }

              const Icon = item.icon!;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-xs font-semibold group relative overflow-hidden',
                    isActive
                      ? 'bg-muted text-foreground font-bold shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-lg shadow-primary" />
                  )}
                  <Icon size={16} className={cn('transition-transform group-hover:scale-110', item.color)} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="text-muted-foreground/50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom user status card */}
        <div className="pt-4 mt-6 border-t border-border/50 space-y-3">
          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
              <Sparkles size={13} className="text-amber-500" />
              <span>AdBez Coins Available</span>
            </div>
            <p className="font-['Space_Grotesk'] text-xl font-black text-emerald-600">
              {formatCurrency(balance)}
            </p>
            <Link href="/dashboard/wallet">
              <button className="w-full py-1.5 mt-1 rounded-xl bg-background hover:bg-muted text-[11px] font-bold text-foreground border border-border transition-colors">
                + Deposit Funds
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 px-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate text-[11px]">{user?.email || 'Authenticated Node'}</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Content */}
      <main className="flex-1 min-w-0 p-6 md:p-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
