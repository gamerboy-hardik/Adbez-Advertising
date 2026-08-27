'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ShoppingBasket, LogIn, UserPlus, LogOut, Shield, Wallet, Plus, Menu } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  const [showTopUp, setShowTopUp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getTotalItems, toggleDrawer } = useCartStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore() as any;
  const totalItems = getTotalItems();
  
  // Mobile UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[100] w-full h-[58px] flex items-center justify-between px-6 gap-4 transition-all duration-300 border-b
        ${scrolled
          ? 'bg-background/95 backdrop-blur-xl border-border shadow-md'
          : 'bg-background/80 backdrop-blur-lg border-transparent'
        }`}
    >
      {/* Scroll Progress */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] z-50 origin-left"
        style={{ scaleX, background: 'linear-gradient(90deg, var(--accent), #8B5CF6)' }}
      />

      {/* Left / Mobile Menu */}
      <div className="flex-1 flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button 
          className="md:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          onClick={() => {
            // Dispatch a custom event to toggle sidebar
            window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
          }}
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Center Logo */}
      <Link href="/" className="flex items-baseline gap-2 no-underline shrink-0 group">
        <span className="font-['Outfit'] font-extrabold text-[20px] text-foreground tracking-tight transition-colors group-hover:opacity-80">
          AdBez
        </span>
        <span className="font-['Outfit'] text-[9px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
          Advertising
        </span>
      </Link>

      {/* Right Actions */}
      <div className="flex-1 flex items-center gap-3 shrink-0 justify-end">
        {/* Mobile Cart Toggle */}
        <button 
          className="md:hidden relative p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          onClick={toggleDrawer}
        >
          <ShoppingBasket size={20} />
          {mounted && totalItems > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-[var(--accent)] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-background">
              {totalItems}
            </span>
          )}
        </button>

        {/* Agency Dashboard Trigger */}
        <Link 
          href="/dashboard" 
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--accent)]/10 to-violet-600/10 hover:from-[var(--accent)]/20 hover:to-violet-600/20 border border-[var(--accent)]/30 text-[var(--accent)] font-['Space_Grotesk'] font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-sm no-underline"
        >
          <span>⚡ Agency Matrix</span>
        </Link>

        {/* Desktop Cart Toggle */}
        <button
          onClick={toggleDrawer}
          className="hidden md:flex relative w-[38px] h-[38px] bg-card border border-border rounded-xl items-center justify-center cursor-pointer text-muted-foreground hover:border-[var(--border-accent)] hover:text-foreground hover:shadow-glow-sm transition-all active:scale-95"
          title="Open Cart"
        >
          <ShoppingBasket size={17} />
          {mounted && totalItems > 0 && (
            <span className="pulse-glow absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-gradient-to-r from-[var(--accent)] to-indigo-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
              {totalItems}
            </span>
          )}
        </button>

        {/* Auth Section */}
        {mounted ? (
          isAuthenticated() ? (
            <div className="flex items-center gap-2.5">
              {/* Wallet (Desktop) */}
              <Link href="/dashboard/wallet" className="no-underline">
                <div className="hidden lg:flex items-center gap-2.5 bg-card border border-border rounded-xl px-3 py-1.5 transition-all hover:border-[var(--border-accent)] cursor-pointer">
                  <Wallet size={13} className="text-[var(--accent)]" />
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-0.5 m-0">AdBez Coins</p>
                    <p className="font-display font-extrabold text-[13px] text-[var(--accent)] m-0">${user?.walletBalance?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </Link>

              {/* Admin Dashboard Badge */}
              {isAdmin() && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--accent)] border border-[rgba(var(--accent-rgb),0.3)] bg-[var(--accent-subtle)] no-underline hover:border-[var(--accent)] hover:shadow-glow-sm transition-all"
                >
                  <Shield size={13} /> Admin
                </Link>
              )}

              {/* User Info (Desktop) */}
              <div className="hidden md:flex flex-col items-end pl-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">{user?.role || 'CLIENT'}</span>
                <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">{user?.email?.split('@')[0]}</span>
              </div>

              <div className="hidden md:block h-6 w-px bg-border mx-0.5" />
              
              <button 
                onClick={logout} 
                className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 text-xs font-semibold" 
                title="Sign Out"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 rounded-xl text-xs font-bold text-foreground bg-card border border-border hover:border-[var(--border-hover)] transition-all flex items-center gap-1.5 no-underline">
                <LogIn size={14} /> Log In
              </Link>
              <Link href="/login?mode=signup" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[var(--accent)] to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 transition-all flex items-center gap-1.5 shadow-glow no-underline">
                <UserPlus size={14} /> Sign Up
              </Link>
            </div>
          )
        ) : (
          <div className="flex gap-2 w-[150px] h-9 bg-muted/50 rounded-xl animate-pulse" />
        )}
      </div>

      <style jsx>{`
        .hide-mobile { }
        @media(max-width:640px){ .hide-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}
