'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MonitorSmartphone, Globe, Video, Share2, Search, Wallet, TrendingUp, 
  Layers, ArrowRight, Sparkles, Activity, ShieldCheck 
} from 'lucide-react';
import { useAgencyStore } from '@/store/useAgencyStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';

export default function DashboardOverview() {
  const { accounts, walletFlows } = useAgencyStore();
  const { user } = useAuthStore();
  const balance = user?.walletBalance ?? 294.90;

  const totalSpendLimit = (accounts || []).reduce((acc, a) => acc + (a.status === 'Active' ? a.spendLimit : 0), 0);
  const totalBalanceInAds = (accounts || []).reduce((acc, a) => acc + a.currentBalance, 0);

  const platforms = [
    { name: 'Facebook (Meta)', slug: 'meta', icon: MonitorSmartphone, color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/50', hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500', bg: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-background', iconBg: 'bg-white dark:bg-blue-900/40' },
    { name: 'Google Ads MCC', slug: 'google', icon: Globe, color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/50', hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500', bg: 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-background', iconBg: 'bg-white dark:bg-amber-900/40' },
    { name: 'TikTok Business', slug: 'tiktok', icon: Video, color: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-900/50', hoverBorder: 'hover:border-pink-400 dark:hover:border-pink-500', bg: 'bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/40 dark:to-background', iconBg: 'bg-white dark:bg-pink-900/40' },
    { name: 'Snapchat Agency', slug: 'snapchat', icon: Share2, color: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-900/50', hoverBorder: 'hover:border-yellow-400 dark:hover:border-yellow-500', bg: 'bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/40 dark:to-background', iconBg: 'bg-white dark:bg-yellow-900/40' },
    { name: 'Bing Ads VIP', slug: 'bing', icon: Search, color: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-900/50', hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-500', bg: 'bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/40 dark:to-background', iconBg: 'bg-white dark:bg-sky-900/40' },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="p-8 rounded-3xl border border-border bg-card relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>Institutional Media Buying Hub</span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Welcome back to your AdBez Control Matrix.
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Manage your corporate whitelisted advertising accounts, top up ad spend with zero friction, and monitor double-entry financial audit logs across all tier-1 ad networks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/dashboard/wallet">
              <button className="btn-primary px-6 py-3.5 text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow shadow-primary/20">
                <Wallet size={16} /> Recharge AdBez Coins
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-border bg-card relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AdBez Wallet Balance</p>
              <h3 className="font-['Space_Grotesk'] text-2xl font-black text-emerald-400 mt-0.5">{formatCurrency(balance)}</h3>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/80">Available immediately for ad account top-ups & setup fees.</p>
        </div>

        <div className="p-6 rounded-3xl border border-border bg-card relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Ad Spend Pool</p>
              <h3 className="font-['Space_Grotesk'] text-2xl font-black text-foreground mt-0.5">{formatCurrency(totalBalanceInAds)}</h3>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/80">Total working advertising balance currently allocated in platforms.</p>
        </div>

        <div className="p-6 rounded-3xl border border-border bg-card relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Daily Whitelisted Limit</p>
              <h3 className="font-['Space_Grotesk'] text-2xl font-black text-violet-400 mt-0.5">${(totalSpendLimit / 1000).toFixed(0)}K / Day</h3>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/80">Combined maximum scaling capacity across all agency ad accounts.</p>
        </div>
      </div>

      {/* Advertising Platforms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-foreground tracking-tight">Platform Operations Hubs</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select a network to manage accounts, recharge spend, or request BM sharing.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map((p, idx) => {
            const count = (accounts || []).filter(a => a.platform === p.slug.toUpperCase()).length;
            const Icon = p.icon;
            return (
              <motion.div 
                key={p.slug}
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/dashboard/${p.slug}`}>
                  <div className={`p-6 rounded-3xl border ${p.border} ${p.hoverBorder} ${p.bg} transition-all duration-300 shadow-sm hover:shadow-md relative group overflow-hidden`}>
                    <div className="flex items-start justify-between mb-8">
                      <div className={`p-3.5 rounded-2xl ${p.iconBg} shadow-sm border border-black/5 dark:border-white/10 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} className={p.color} />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-background/80 border border-border text-[10px] font-bold text-muted-foreground backdrop-blur-sm">
                        {count} Active Assets
                      </span>
                    </div>

                    <h3 className="font-['Space_Grotesk'] text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Recharge spend, apply for accounts, & link Business Managers.
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                      <span>Enter Control Matrix</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Quick Knowledge Base Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Link href="/dashboard/guide">
              <div className="bg-card p-6 rounded-3xl border border-dashed border-border hover:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between group bg-gradient-to-br from-violet-500/5 to-transparent">
                <div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-3.5 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-bold text-[10px]">
                      5 Tutorials
                    </span>
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold text-foreground group-hover:text-violet-400 transition-colors">
                    Interactive Agency Guide
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Step-by-step interactive walkthroughs on how to deposit funds, scale spend, and optimize proxy setups.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400 mt-4 group-hover:translate-x-1 transition-transform">
                  <span>Launch Interactive Guide</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Recent Ledger Activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-foreground flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" /> Recent Wallet & Ad Spend Flows
          </h2>
          <Link href="/dashboard/wallet" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View full double-entry ledger <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                <th className="px-6 py-3.5 text-left">Event Description</th>
                <th className="px-6 py-3.5 text-left">Category</th>
                <th className="px-6 py-3.5 text-left">Amount</th>
                <th className="px-6 py-3.5 text-left">Balance After</th>
                <th className="px-6 py-3.5 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {(walletFlows || []).slice(0, 4).map((f) => (
                <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{f.description}</td>
                  <td className="px-6 py-4 text-muted-foreground"><span className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-[10px]">{f.category}</span></td>
                  <td className={`px-6 py-4 font-['Space_Grotesk'] font-bold ${f.type === 'Credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {f.type === 'Credit' ? '+' : '-'}{formatCurrency(f.amount)}
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-foreground">{formatCurrency(f.balanceAfter)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
