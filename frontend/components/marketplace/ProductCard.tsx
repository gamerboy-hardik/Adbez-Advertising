'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Crown, Zap, Shield } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';
import { logFootprint } from '@/lib/fingerprint';
import type { AdAccount } from '@/types';

const PLATFORM_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  META:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   label: 'META'   },
  GOOGLE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   label: 'GOOGLE' },
  TIKTOK: { color: '#ec4899', bg: 'rgba(236,72,153,0.1)',   label: 'TIKTOK' },
  BING:   { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',    label: 'BING'   },
};

const BrandIcon = ({ type, color }: { type: string, color: string }) => {
  if (type === 'META') return <svg width="34" height="34" viewBox="0 0 16 16" fill={color}><path d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a55 55 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3q.477-.001.924.122c.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714m1.516 2.224q-.378-.615-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87zM4.846 4.756c.725.1 1.385.634 2.34 2.001A212 212 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264q.137 0 .27.018"/></svg>;
  if (type === 'TIKTOK') return <svg width="34" height="34" viewBox="0 0 448 512" fill={color}><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>;
  if (type === 'GOOGLE') return <svg width="34" height="34" viewBox="0 0 488 512" fill={color}><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>;
  if (type === 'BING') return <svg width="34" height="34" viewBox="0 0 384 512" fill={color}><path d="M0,0V362.5L160,432l0-149.2L68,245.5,68,91.2l92,34.4,0,386.4L384,435.5,384,204,160,116Z"/></svg>;
  return <div style={{ fontSize: 34 }}>🌐</div>;
};

interface ProductCardProps {
  account: AdAccount;
  compact?: boolean;
}

export function ProductCard({ account, compact = false }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addItem, items } = useCartStore();
  const { info } = useToastStore();

  const inCart = items.some(i => i.id === account.id);
  const p = PLATFORM_CONFIG[account.platform] || { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', label: account.platform };
  const available = account.status === 'AVAILABLE';

  const handleAdd = () => {
    if (!available) { info('This account is no longer available.'); return; }
    addItem(account);
    logFootprint('ADD_TO_CART', window.location.pathname);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="fade-up glass-card relative w-full flex items-center gap-3 transition-all duration-200"
        style={{ padding: '16px 20px', borderRadius: '1.25rem', overflow: 'hidden' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
        <div className="live-dot flex-shrink-0" style={{ background: available ? 'var(--success)' : 'var(--text-muted)', boxShadow: available ? '0 0 10px rgba(16,185,129,0.5)' : 'none', animation: available ? undefined : 'none' }} />
        <div style={{ width: 42, height: 42, borderRadius: 12, background: p.bg, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: `inset 0 0 10px ${p.color}15` }}>
          <BrandIcon type={account.platform} color={p.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
          <p className="font-display font-bold text-[14px] text-foreground truncate m-0">{account.profileName}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-semibold m-0">{account.platform}</p>
        </div>
        <span className="price-tag font-display font-black text-[17px] text-foreground flex-shrink-0 bg-muted/50 dark:bg-muted/50 px-3 py-1 rounded-lg border border-border/50">${account.price}</span>
        <button onClick={handleAdd} className={`btn-cart ${added ? 'bg-success text-white border-success' : 'bg-card text-muted-foreground border-border hover:border-accent hover:text-accent'} border rounded-xl flex items-center justify-center transition-all shadow-sm z-10 active:scale-95`} style={{ width: 36, height: 36 }}>
          {added ? <CheckCircle2 size={16} /> : <Plus size={16} />}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`fade-up ad-card hover-shine group flex flex-col items-center text-center relative ${account.isFeatured ? 'featured' : ''}`}
      style={{ padding: '28px 22px', borderRadius: '1.25rem' }}
    >
      {/* Top gradient stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{
          background: account.isFeatured
            ? `linear-gradient(90deg, ${p.color}, var(--accent))`
            : `linear-gradient(90deg, ${p.color}50, transparent)`,
        }}
      />

      {/* Featured badge */}
      {account.isFeatured && (
        <div className="absolute top-4 right-4">
          <span className="badge" style={{ gap: 4 }}>
            <Crown size={10} /> Premium
          </span>
        </div>
      )}

      {/* Centered Logo */}
      <div
        className="mb-6 mt-3 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 relative z-10"
        style={{
          width: 72, height: 72, borderRadius: 22,
          background: p.bg,
          border: `1px solid ${p.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 32px -8px ${p.color}50, inset 0 0 20px ${p.color}20`
        }}
      >
        <BrandIcon type={account.platform} color={p.color} />
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span
          className="text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md"
          style={{ background: p.bg, color: p.color, border: `1px solid ${p.color}25` }}
        >
          {p.label}
        </span>
        <span className="flex items-center gap-1">
          <span className="live-dot" style={{ width: 6, height: 6, background: available ? 'var(--success)' : 'var(--text-muted)', boxShadow: available ? '0 0 6px rgba(16,185,129,0.8)' : 'none', animation: available ? undefined : 'none' }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: available ? 'var(--success)' : 'var(--text-muted)' }}>
            {available ? 'In Stock' : account.status}
          </span>
        </span>
      </div>

      <h3 className="font-display font-black text-[18px] text-foreground leading-snug mb-3 line-clamp-2 px-2">
        {account.profileName}
      </h3>

      {/* Description */}
      {account.description && (
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-5 m-0">
          {account.description}
        </p>
      )}

      {/* Tags */}
      {account.features.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-5">
          {account.features.slice(0, 4).map(f => (
            <span key={f} className="text-[11px] font-semibold py-1 px-2.5 rounded-lg bg-card border border-border text-[var(--text-secondary)] transition-colors hover:border-[var(--border-accent)] hover:text-[var(--accent)]">
              {f}
            </span>
          ))}
          {account.features.length > 4 && (
            <span className="text-[11px] font-semibold py-1 px-2.5 rounded-lg bg-card border border-border text-muted-foreground">
              +{account.features.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Meta row */}
      {(account.ageMonths || account.spendingLimit || account.country) && (
        <div className="flex justify-center gap-4 flex-wrap mb-6">
          {account.ageMonths && (
            <div className="flex items-center gap-1.5">
              <Zap size={12} style={{ color: p.color }} />
              <span className="text-xs text-[var(--text-secondary)] font-medium">{account.ageMonths}m aged</span>
            </div>
          )}
          {account.spendingLimit && (
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-success" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">${account.spendingLimit.toLocaleString('en-US')} limit</span>
            </div>
          )}
          {account.country && (
            <span className="text-xs text-muted-foreground font-medium">{account.country}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-4 pt-5 mt-auto border-t border-border w-full">
        <div className="flex flex-col items-start">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5 m-0">Price</p>
          <span className="price-tag text-[26px]" style={{ color: account.isFeatured ? p.color : 'var(--text-primary)' }}>
            ${account.price}
          </span>
        </div>
        <button
          onClick={handleAdd}
          className={`btn-cart ${added ? 'added' : ''}`}
          style={{
            flex: 1, height: 44,
            ...(account.isFeatured ? {
              background: `linear-gradient(135deg, ${p.color}, var(--accent))`,
              color: 'white',
              border: 'none',
              boxShadow: `0 4px 20px ${p.color}40`,
            } : {}),
          }}
        >
          {added ? (
            <><CheckCircle2 size={16} /> Added!</>
          ) : (
            <><Plus size={16} /> {inCart ? 'Add Again' : 'Add to Cart'}</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
