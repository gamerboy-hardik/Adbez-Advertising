'use client';
import { motion } from 'framer-motion';
import { ShoppingBasket, X, Trash2, Minus, Plus, ArrowRight, Tag, Wallet } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { transactionsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logFootprint } from '@/lib/fingerprint';

export function CartDrawer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    items, isDrawerOpen, setDrawerOpen,
    removeItem, updateQuantity, clearCart,
    getTotalItems, getTotalPrice, getDiscount, getFinalPrice, getAccountIds,
  } = useCartStore();
  const { isAuthenticated, user } = useAuthStore() as any;
  const { success, error, info } = useToastStore();

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const discount = getDiscount();
  const finalPrice = getFinalPrice();
  const totalItems = getTotalItems();

  if (!mounted) return null;

  const handleCheckout = async () => {
    if (!isAuthenticated()) {
      info('Please log in or sign up to complete your purchase.');
      setDrawerOpen(false);
      return;
    }
    if (items.length === 0) return;

    const accountIds = getAccountIds();
    setLoading(true);
    try {
      logFootprint('CHECKOUT_INITIATED');
      const res = await transactionsApi.checkout(accountIds);
      if (!res.success) {
        error(res.message || 'Checkout failed. Please try again.');
        return;
      }
      logFootprint('CHECKOUT_COMPLETED');
      clearCart();
      setDrawerOpen(false);
      success('Order placed successfully! Redirecting to credentials...');
      router.push(`/checkout?id=${res.data?.transactionId}`);
    } catch {
      error('An unexpected error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-muted backdrop-blur-sm z-[200]"
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={false}
        animate={{ x: isDrawerOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="fixed inset-y-0 right-0 w-[400px] max-w-full bg-card border-l border-border shadow-md z-[201] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background/80">
          <div className="flex items-center gap-2.5">
            <ShoppingBasket size={15} className="text-muted-foreground" />
            <h2 className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest text-foreground">
              Procurement Pipeline
            </h2>
            {totalItems > 0 && (
              <span className="text-[9px] font-bold bg-primary/15 text-primary border border-cyan-500/20 px-1.5 py-0.5 rounded-full">
                {totalItems} asset{totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <ShoppingBasket size={32} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Pipeline holds zero assets.</p>
              <p className="text-xs text-muted-foreground">Add accounts from the marketplace to get started.</p>
            </div>
          ) : (
            <>
              {/* Volume Discount Banner */}
              {totalItems < 5 && (
                <div className="flex items-center gap-2 bg-emerald-500/[0.07] border border-emerald-500/20 rounded-lg px-3 py-2 mb-3">
                  <Tag size={12} className="text-emerald-400 flex-shrink-0" />
                  <p className="text-[11px] text-emerald-400">
                    Add {5 - totalItems} more asset{5 - totalItems !== 1 ? 's' : ''} to unlock <strong>5% volume discount</strong>
                  </p>
                </div>
              )}
              {discount.percentage > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-2 mb-3"
                >
                  <Tag size={12} className="text-emerald-400 flex-shrink-0" />
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    🎉 {discount.label} applied!
                  </p>
                </motion.div>
              )}

              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 p-3 bg-muted border border-border rounded-xl"
                >
                  {/* Platform Icon */}
                  <div className="w-9 h-9 rounded-full bg-primary/[0.04] border border-border flex items-center justify-center text-base flex-shrink-0">
                    {item.countryFlag || '🏳'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">${item.price} × {item.quantity}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 rounded border border-border bg-primary/[0.03] text-muted-foreground hover:border-cyan-500/30 hover:text-primary transition-colors flex items-center justify-center"
                    >
                      <Minus size={9} />
                    </button>
                    <span className="text-xs font-bold text-foreground w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 rounded border border-border bg-primary/[0.03] text-muted-foreground hover:border-cyan-500/30 hover:text-primary transition-colors flex items-center justify-center"
                    >
                      <Plus size={9} />
                    </button>
                  </div>

                  {/* Price + Remove */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border bg-background/90 space-y-3">
            {/* Wallet balance check */}
            {isAuthenticated() && user && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Wallet size={11} />
                  Wallet Balance
                </span>
                <span className={`font-['Space_Grotesk'] font-bold ${user.walletBalance >= finalPrice ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(user.walletBalance)}
                </span>
              </div>
            )}

            {/* Subtotal */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-['Space_Grotesk'] font-bold text-foreground">{formatCurrency(getTotalPrice())}</span>
            </div>

            {/* Discount */}
            {discount.percentage > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400">{discount.label}</span>
                <span className="font-['Space_Grotesk'] font-bold text-emerald-400">
                  -{formatCurrency(getTotalPrice() - finalPrice)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-foreground font-semibold">Net Total</span>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-foreground">{formatCurrency(finalPrice)}</span>
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/10 dark:shadow-white/10"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>Initialize Provisioning Core <ArrowRight size={14} /></>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
}
