'use client';
import dynamic from 'next/dynamic';
import { ShieldCheck, Zap, Lock, Clock, BadgeCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Dynamically import 3D canvas to avoid SSR issues
const HeroCanvas = dynamic(() => import('@/components/three/HeroCanvas').then(m => m.HeroCanvas), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-background" />
});

const trustItems = [
  { icon: Zap,        label: 'Instant Delivery',  color: 'text-amber-400'   },
  { icon: Lock,       label: '100% Secure',       color: 'text-emerald-400' },
  { icon: Clock,      label: '24/7 Support',      color: 'text-blue-400'    },
  { icon: BadgeCheck, label: 'Premium Verified',  color: 'text-violet-400'  },
];

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 min-h-[240px] border border-border"
      style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%)' }}
    >
      {/* Three.js 3D background */}
      <div className="absolute inset-0 opacity-60">
        <HeroCanvas />
      </div>

      {/* Dark gradient overlay so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-10">
        {/* Left: Content */}
        <div className="flex-1">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Trusted by 1000+ Marketers</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3">
            Premium Agency<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Ad Accounts
            </span>{' '}& Assets
          </h1>

          <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-7">
            Institutional-grade accounts, business managers, and verified assets designed to scale your ad operations safely and reliably.
          </p>

          {/* Trust row */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {trustItems.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={14} className={color} />
                <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTA card */}
        <div className="flex-shrink-0 w-full lg:w-auto lg:min-w-[200px]">
          <div className="rounded-xl border border-border p-5 flex flex-col gap-4"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              <span className="text-sm font-bold text-white">Get Started</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Browse 100+ verified accounts across all major ad platforms.</p>
            <Link href="/login?mode=signup"
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.35)]"
            >
              Create Account <ArrowRight size={13} />
            </Link>
            <Link href="/login"
              className="flex items-center justify-center gap-2 bg-muted/50 hover:bg-muted/50 border border-border text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
