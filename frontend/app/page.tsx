'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, TrendingUp, Users, Activity, ShoppingCart, BarChart3, Shield, Zap, Lock } from 'lucide-react';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Sidebar } from '@/components/layout/Sidebar';
import { CartDrawer } from '@/components/marketplace/CartDrawer';
import { RightPanel } from '@/components/layout/RightPanel';
import { accountsApi } from '@/lib/api';
import { logFootprint } from '@/lib/fingerprint';
import type { AdAccount } from '@/types';
import { AdminOverviewDashboard } from '@/components/admin/AdminOverviewDashboard';
import { AccountModal } from '@/components/admin/AccountModal';
import dynamic from 'next/dynamic';



// ─── Placeholder data shown while API loads ───────────
const PLACEHOLDER_ACCOUNTS: AdAccount[] = [
  { id: 'ph1', platform: 'META', category: 'ad-accounts', profileName: 'US Meta Agency Account', country: 'US', countryFlag: '🇺🇸', spendingLimit: 50000, ageMonths: 24, price: 149, status: 'AVAILABLE', features: ['Credit Line', 'Uncapped', 'Verified BM', 'Agency'], description: 'High-trust US Meta agency account with $50K spend history, fully warmed and ready to scale.', isFeatured: true, createdAt: '' },
  { id: 'ph2', platform: 'GOOGLE', category: 'ad-accounts', profileName: 'Google Ads MCC Account', country: 'UK', countryFlag: '🇬🇧', spendingLimit: 100000, ageMonths: 36, price: 299, status: 'AVAILABLE', features: ['MCC Access', 'Clean History', 'High Limit', '3yr Aged'], description: 'Premium Google Ads MCC with £100K spend limit and 3 years of clean ad history.', isFeatured: true, createdAt: '' },
  { id: 'ph3', platform: 'TIKTOK', category: 'ad-accounts', profileName: 'TikTok Business Center', country: 'SG', countryFlag: '🇸🇬', spendingLimit: 30000, ageMonths: 12, price: 89, status: 'AVAILABLE', features: ['Pixel Ready', 'Verified', 'SEA Region'], description: 'TikTok Business Center account with verified merchant status for South East Asia region.', isFeatured: false, createdAt: '' },
  { id: 'ph4', platform: 'META', category: 'profiles', profileName: 'High-Trust FB Profile US', country: 'US', countryFlag: '🇺🇸', spendingLimit: null, ageMonths: 48, price: 45, status: 'AVAILABLE', features: ['Friends Seeded', 'OG Account', 'US IP History'], description: 'Organic US Facebook profile aged 4 years with natural activity history.', isFeatured: false, createdAt: '' },
  { id: 'ph5', platform: 'META', category: 'bm-verified', profileName: 'Verified BM — Corporate Tier', country: 'AE', countryFlag: '🇦🇪', spendingLimit: 200000, ageMonths: 18, price: 499, status: 'AVAILABLE', features: ['Corporate Verified', 'UAE Entity', '$200K Spend Cap', 'Whitelisted'], description: 'Corporate-tier Verified Business Manager from UAE entity with $200K monthly spend allocation.', isFeatured: true, createdAt: '' },
  { id: 'ph6', platform: 'BING', category: 'ad-accounts', profileName: 'Bing Ads Aged Account', country: 'CA', countryFlag: '🇨🇦', spendingLimit: 25000, ageMonths: 20, price: 65, status: 'AVAILABLE', features: ['CAD Billing', 'Clean History', 'Aged 20m'], description: 'Aged Canadian Bing Ads account with CAD billing and $25K spend history.', isFeatured: false, createdAt: '' },
];

const CATEGORY_LABELS: Record<string, string> = {
  all:           'All Infrastructure Assets',
  'ad-accounts': 'Agency Ad Accounts',
  profiles:      'FB Profiles',
  'bm-standard': 'Business Managers',
  'bm-verified': 'Verified BMs',
  pages:         'Niche Pages',
};

function SkeletonCard() {
  return (
    <div className="ad-card" style={{ gap: 16, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
          <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 6 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 12, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 6 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        {[50, 70, 60].map(w => <div key={w} className="skeleton" style={{ height: 22, width: w, borderRadius: 8 }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <div className="skeleton" style={{ height: 30, width: 64, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 38, width: 120, borderRadius: 14 }} />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [accounts, setAccounts] = useState<AdAccount[]>(PLACEHOLDER_ACCOUNTS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategory, setAddCategory] = useState('ad-accounts');
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Load category counts without blocking the UI
    accountsApi.getCategoryStats().then(res => {
      if (res.success && res.data) setCategoryCounts(res.data.stats);
    }).catch(() => {});
    logFootprint('PAGE_VIEW', '/');
  }, []);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setHasFetched(false);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (activeCategory !== 'all' && activeCategory !== 'admin-overview') params.category = activeCategory;
      if (search.trim()) params.search = search.trim();
      const res = await accountsApi.list(params);
      if (res.success && res.data && res.data.accounts.length > 0) {
        setAccounts(res.data.accounts);
      } else {
        // Keep placeholders if backend has no data yet
        setAccounts(PLACEHOLDER_ACCOUNTS);
      }
    } catch {
      setAccounts(PLACEHOLDER_ACCOUNTS);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    if (activeCategory === 'admin-overview') return;
    const t = setTimeout(loadAccounts, search ? 400 : 100);
    return () => clearTimeout(t);
  }, [loadAccounts, search, activeCategory]);

  const handleAddClick = (cat: string) => { setAddCategory(cat); setShowAddModal(true); };

  const grouped = [
    { key: 'ad-accounts', items: accounts.filter(a => a.category === 'ad-accounts') },
    { key: 'bm-verified', items: accounts.filter(a => a.category === 'bm-verified') },
    { key: 'profiles',    items: accounts.filter(a => a.category === 'profiles')    },
    { key: 'bm-standard', items: accounts.filter(a => a.category === 'bm-standard') },
    { key: 'pages',       items: accounts.filter(a => a.category === 'pages')       },
  ].filter(g => g.items.length > 0);

  return (
    <div className="flex h-[calc(100vh-58px)] overflow-hidden items-start">
      {/* Left Sidebar */}
      <Sidebar 
        activeCategory={activeCategory} 
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          if (cat !== 'all') {
            document.getElementById(cat)?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }} 
        counts={categoryCounts} 
        onAddClick={handleAddClick} 
      />

      {/* Main */}
      <main className="custom-scrollbar flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-4 md:p-8">
        {activeCategory === 'admin-overview' ? (
          <AdminOverviewDashboard />
        ) : (
          <>
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-[24px] mb-6 md:mb-8 min-h-[220px] md:min-h-[280px] border border-border">
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/20" />
              
              <div className="relative z-10 p-6 md:p-12 flex flex-col gap-4 md:gap-5 max-w-[680px]">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--success-subtle)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '5px 14px', width: 'fit-content' }}
                >
                  <span className="live-dot" />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--success)' }}>Trusted by 1000+ Marketers</span>
                </motion.div>
                
                <motion.h1 
                  initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: 1.15, color: 'var(--text-primary)', margin: 0 }}
                >
                  <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{ display: 'block' }}>Institutional-Grade</motion.span>
                  <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="gradient-text" style={{ display: 'block' }}>Ad Account Infrastructure</motion.span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                  style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, maxWidth: 480 }}
                >
                  Premium verified ad accounts, business managers, and Facebook assets built for institutional-scale media buying operations.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 28px', marginTop: 12 }}
                >
                  <button className="btn-gradient" style={{ padding: '10px 22px', borderRadius: 12, fontWeight: 600, fontSize: 14, color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(var(--accent-rgb), 0.2)' }}>
                    Get Started
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Cinematic Features (Scroll Reveal) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-10">
              {[
                { title: "100% Verified", desc: "Every asset is manually vetted by our QA team before listing.", icon: Shield, color: "#8b5cf6" },
                { title: "Instant Delivery", desc: "Assets are delivered to your inventory instantly upon purchase.", icon: Zap, color: "#22d3ee" },
                { title: "AES-256 Encrypted", desc: "Credentials are encrypted at rest for maximum security.", icon: Lock, color: "#10b981" }
              ].map((feat, idx) => (
                <motion.div 
                  key={feat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="glass-card"
                  style={{ padding: 24 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <feat.icon size={20} style={{ color: feat.color }} />
                  </div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{feat.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats Row */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-2 md:grid-cols-auto-fit gap-3 md:gap-4 mb-6 md:mb-8"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
            >
              {[
                { label: 'Active Assets',   val: '2,492', icon: Activity,   color: '#3b82f6' },
                { label: 'Trusted Clients', val: '1,084', icon: Users,      color: '#10b981' },
                { label: 'Avg Uptime',      val: '99.9%', icon: TrendingUp, color: '#8b5cf6' },
                { label: 'Daily Orders',    val: '340+',  icon: ShoppingCart,color: '#f59e0b' },
                { label: 'Platforms',       val: '4+',    icon: BarChart3,   color: '#ec4899' },
              ].map(({ label, val, icon: Icon, color }) => (
                <motion.div key={label} variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } } }} className="stat-card">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon size={17} style={{ color }} />
                  </div>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', margin: '0 0 4px' }}>{val}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-9">
              <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
                <Search size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search ad accounts, profiles, BMs..."
                  style={{ paddingLeft: 44, paddingRight: 16 }}
                />
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}>
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>

            {/* Internal Category Navigation */}
            <div className="bg-background/80" style={{ position: 'sticky', top: -28, zIndex: 40, backdropFilter: 'blur(24px)', padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: 32, display: 'flex', gap: 12, overflowX: 'auto' }}>
              <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
              {grouped.map(({ key }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ 
                    padding: '8px 18px', borderRadius: 20, whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600, 
                    background: activeCategory === key ? 'var(--accent-subtle)' : 'var(--bg-glass)',
                    color: activeCategory === key ? 'var(--accent)' : 'var(--text-secondary)',
                    border: `1px solid ${activeCategory === key ? 'rgba(var(--accent-rgb),0.25)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  {CATEGORY_LABELS[key] || key}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              grouped.map(({ key, items }) => (
                <section key={key} id={key} style={{ marginBottom: 56, scrollMarginTop: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px rgba(var(--accent-rgb),0.6)', display: 'inline-block' }} />
                      {CATEGORY_LABELS[key] || key}
                    </h2>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {items.length} assets
                    </span>
                  </div>
                  {key === 'profiles' || key === 'bm-standard' || key === 'pages' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                      {items.map(a => <ProductCard key={a.id} account={a} compact />)}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                      {items.map(a => <ProductCard key={a.id} account={a} />)}
                    </div>
                  )}
                </section>
              ))
            )}
          </>
        )}
      </main>
      <RightPanel />
      <CartDrawer />
      <AccountModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); loadAccounts(); }}
        defaultCategory={addCategory}
      />
    </div>
  );
}
