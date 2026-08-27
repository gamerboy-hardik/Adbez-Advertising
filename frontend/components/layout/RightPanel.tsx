'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Trash2, ArrowRight, Wallet, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function RightPanel() {
  const { items, removeItem, getFinalPrice, getTotalItems, getDiscount, toggleDrawer } = useCartStore();
  const { user, isAuthenticated } = useAuthStore() as any;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <aside className="hidden lg:block sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-5 px-4 space-y-4 w-[300px] flex-shrink-0 custom-scrollbar" />;
  }

  return (
    <aside className="hidden lg:block sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-5 px-4 space-y-4 w-[300px] flex-shrink-0 custom-scrollbar">
      
      {/* Cart Panel */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
          <ShoppingCart size={14} className="text-[var(--accent)]" />
          <span className="text-sm font-bold text-foreground">Your Cart</span>
          {getTotalItems() > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[rgba(var(--accent-rgb),0.2)] px-2 py-0.5 rounded-full">
              {getTotalItems()}
            </span>
          )}
        </div>

        <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2.5 p-2.5 bg-card-hover border border-border rounded-xl hover:border-[var(--border-hover)] transition-all group">
              <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-base flex-shrink-0">
                {item.countryFlag || '🏳'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate m-0">{item.name}</p>
                <p className="text-[10px] text-muted-foreground m-0">${item.price} × {item.quantity}</p>
              </div>
              <span className="text-xs font-bold text-foreground font-mono flex-shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          
          {/* Auto-included Free Support */}
          <div className="flex items-center gap-2.5 p-2.5 bg-[var(--accent-subtle)] border border-[rgba(var(--accent-rgb),0.15)] rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-[rgba(var(--accent-rgb),0.1)] border border-[rgba(var(--accent-rgb),0.15)] flex items-center justify-center flex-shrink-0">
              <Sparkles size={14} className="text-[var(--accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[var(--accent)] truncate m-0">24/7 VIP Support</p>
              <p className="text-[10px] text-[var(--accent)] opacity-60 m-0">Included with all orders</p>
            </div>
            <span className="text-xs font-bold text-[var(--accent)] font-mono flex-shrink-0">
              $0.00
            </span>
            <div className="w-[12px] flex-shrink-0" />
          </div>
        </div>

        {items.length > 0 && (
          <div className="px-4 py-3.5 border-t border-border bg-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Subtotal</span>
              <span className="text-sm font-bold text-foreground font-mono">{formatCurrency(getFinalPrice())}</span>
            </div>
            {getDiscount().percentage > 0 && (
              <p className="text-[10px] text-success font-medium m-0">✓ {getDiscount().label} applied</p>
            )}
            <button
              onClick={toggleDrawer}
              className="w-full py-2.5 bg-gradient-to-r from-[var(--accent)] to-indigo-500 hover:from-[var(--accent-hover)] hover:to-indigo-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow active:scale-95"
            >
              View Cart & Checkout <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Wallet Widget */}
      {isAuthenticated() && user && (
        <div className="rounded-2xl p-4 border border-[rgba(var(--accent-rgb),0.12)] bg-gradient-to-br from-[var(--accent-subtle)] to-[rgba(6,182,212,0.05)]">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={14} className="text-[var(--accent)]" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground m-0">Wallet Balance</p>
          </div>
          <p className="text-3xl font-bold text-foreground font-mono tracking-tight mb-4 m-0">
            {formatCurrency(user.walletBalance)}
          </p>
          <button className="w-full py-2 bg-[var(--accent-subtle)] hover:bg-[rgba(var(--accent-rgb),0.15)] border border-[rgba(var(--accent-rgb),0.15)] text-[var(--accent)] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
            <Plus size={12} /> Add Funds
          </button>
        </div>
      )}

      {/* Quick Info */}
      <div className="space-y-1.5">
        {[
          { label: 'Instant Delivery', val: '< 5 min' },
          { label: 'Satisfaction Rate', val: '99.2%' },
          { label: 'Secure Escrow', val: 'AES-256' },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between px-3 py-2.5 bg-card border border-border rounded-lg hover:border-[var(--border-hover)] transition-all">
            <span className="text-[11px] text-muted-foreground">{label}</span>
            <span className="text-[11px] font-bold text-foreground">{val}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
