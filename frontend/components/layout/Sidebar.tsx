'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, Network, UserCheck, Briefcase, ShieldCheck, BookMarked, Plus, LayoutDashboard, Home, Package, ShoppingCart, LifeBuoy } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const categories = [
  { id: 'all',          icon: Layers,       label: 'All Assets',        sub: 'Full Inventory' },
  { id: 'ad-accounts',  icon: Network,      label: 'Ad Accounts',       sub: 'Agency Tier'    },
  { id: 'profiles',     icon: UserCheck,    label: 'FB Profiles',       sub: 'Trust Verified' },
  { id: 'bm-standard',  icon: Briefcase,    label: 'Business Managers', sub: 'Standard Ops'   },
  { id: 'bm-verified',  icon: ShieldCheck,  label: 'Verified BMs',      sub: 'Corporate Tier' },
  { id: 'pages',        icon: BookMarked,   label: 'Niche Pages',       sub: 'Pre-Warmed'     },
];

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  counts?: Record<string, number>;
  onAddClick?: (category: string) => void;
}

export function Sidebar({ activeCategory, onCategoryChange, counts = {}, onAddClick }: SidebarProps) {
  const { isAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleMobileSidebar', handleToggle);
    return () => window.removeEventListener('toggleMobileSidebar', handleToggle);
  }, []);

  const admin = mounted ? isAdmin() : false;

  const handleCategoryClick = (cat: string) => {
    onCategoryChange(cat);
    setIsOpen(false); // Auto-close on mobile
  };

  return (
    <div className="relative h-full flex">
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-muted/50 backdrop-blur-sm z-[90] md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <aside className={`
        fixed top-[58px] bottom-0 left-0 z-[100] w-[260px] flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        md:relative md:top-0 md:transform-none md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-y-auto custom-scrollbar border-r border-border p-5 flex flex-col gap-6 
        bg-background/95 md:bg-background/80 backdrop-blur-md
      `}>

      {/* Main Navigation */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground px-2.5 mb-2">Main Menu</p>
        <nav className="flex flex-col gap-0.5">
          {[
            { href: '/',       label: 'Home',     icon: Home, action: () => onCategoryChange('all') },
            { href: '/',       label: 'Products', icon: Package, action: () => onCategoryChange('all') },
            { href: '/orders', label: 'Orders',   icon: ShoppingCart },
            { href: '#',       label: 'Support',  icon: LifeBuoy },
          ].map(({ href, label, icon: Icon, action }) => (
            action ? (
              <button
                key={label}
                onClick={() => { action(); setIsOpen(false); }}
                className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl border border-transparent text-muted-foreground hover:bg-card hover:text-foreground hover:border-border transition-all text-sm font-semibold no-underline group"
              >
                <Icon size={16} className="group-hover:text-[var(--accent)] transition-colors" />
                {label}
              </button>
            ) : (
              <Link
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent text-muted-foreground hover:bg-card hover:text-foreground hover:border-border transition-all text-sm font-semibold no-underline group"
              >
                <Icon size={16} className="group-hover:text-[var(--accent)] transition-colors" />
                {label}
              </Link>
            )
          ))}
        </nav>
      </div>

      {/* Admin Section */}
      {admin && (
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground px-2.5 mb-2">Admin Tools</p>
          <button
            onClick={() => handleCategoryClick('admin-overview')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
              activeCategory === 'admin-overview'
                ? 'bg-[var(--accent-subtle)] border-[rgba(var(--accent-rgb),0.2)] text-[var(--accent)]'
                : 'bg-transparent border-transparent text-muted-foreground hover:bg-card hover:border-border'
            }`}
          >
            <LayoutDashboard size={16} />
            <div>
              <p className="text-xs font-semibold m-0 text-foreground">Overview Dashboard</p>
              <p className="text-[10px] m-0 text-muted-foreground leading-tight">Manage master inventory</p>
            </div>
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="flex-1">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground px-2.5 mb-2">Shop by Category</p>
        <nav className="flex flex-col gap-0.5">
          {categories.map(({ id, icon: Icon, label, sub }) => {
            const isActive = activeCategory === id;
            const count = id === 'all'
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : (counts[id] || 0);

            return (
              <div key={id} className="relative group">
                <button
                  onClick={() => onCategoryChange(id)}
                  className={`relative w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all group z-10 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {/* Animated Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 bg-gradient-to-r from-[var(--accent-subtle)] to-transparent border border-l-[rgba(var(--accent-rgb),0.2)] border-y-transparent border-r-transparent rounded-xl -z-10 shadow-[inset_4px_0_10px_rgba(var(--accent-rgb),0.05)]"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-[var(--accent)] to-cyan-400" 
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <Icon size={16} className={`transition-colors relative z-10 ${isActive ? 'text-[var(--accent)]' : 'group-hover:text-[var(--accent)]'}`} />
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-xs font-semibold m-0 truncate">{label}</p>
                    <p className="text-[10px] m-0 text-muted-foreground leading-tight">{sub}</p>
                  </div>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[rgba(var(--accent-rgb),0.12)] text-[var(--accent)]'
                        : 'bg-card text-muted-foreground'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>

                {/* Admin + button */}
                {admin && id !== 'all' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddClick?.(id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[var(--accent)] hover:text-white transition-all shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)] z-20"
                    title={`Add to ${label}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      </aside>
    </div>
  );
}
