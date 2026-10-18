'use client';
import { ShieldCheck, Zap, Lock, Clock, BadgeCheck, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const trustItems = [
  { icon: Zap,        label: 'Instant Delivery',  color: 'text-amber-500 dark:text-amber-400'   },
  { icon: Lock,       label: '100% Secure',       color: 'text-emerald-500 dark:text-emerald-400' },
  { icon: Clock,      label: '24/7 Support',      color: 'text-blue-500 dark:text-blue-400'    },
  { icon: BadgeCheck, label: 'Premium Verified',  color: 'text-violet-500 dark:text-violet-400'  },
];

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 min-h-[250px] border border-border bg-gradient-to-br from-card via-card/95 to-background shadow-sm dark:shadow-[0_1px_30px_rgba(0,0,0,0.5)]">
      
      {/* ── Ambient Smooth Glow Orbs (60-120fps Hardware Accelerated) ── */}
      <div className="absolute top-0 -left-20 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-indigo-500/15 blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Subtle grid pattern for institutional aesthetic */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left: Content */}
        <div className="flex-1 max-w-2xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
              Trusted by 1,000+ Media Buyers
            </span>
          </div>

          {/* Headline — 100% High Contrast in both Pure Black & Crisp White */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.15] mb-3 text-slate-900 dark:text-white">
            Premium Agency{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
              Ad Accounts
            </span>{' '}
            & Assets
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mb-6 font-normal">
            Institutional-grade advertising accounts, business managers, and verified assets designed to scale your operations safely, with zero spend cap limits.
          </p>

          {/* Trust Row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2.5 pt-1">
            {trustItems.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={15} className={color} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Card */}
        <div className="flex-shrink-0 w-full lg:w-72">
          <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/90 backdrop-blur-xl p-5 flex flex-col gap-3.5 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] border border-[rgba(var(--accent-rgb),0.2)] flex items-center justify-center text-[var(--accent)]">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground block leading-tight">Instant Provisioning</span>
                <span className="text-[10px] text-muted-foreground block">Verified & KYC cleared</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed m-0">
              Browse institutional ad accounts across Meta, Google Ads MCC, TikTok, and Bing.
            </p>

            <Link 
              href="/login?mode=signup"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent)] to-indigo-600 hover:from-[var(--accent-hover)] hover:to-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-glow active:scale-95 no-underline"
            >
              Create Free Account <ArrowRight size={13} />
            </Link>

            <Link 
              href="/login"
              className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold py-2 px-4 rounded-xl transition-all no-underline"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
