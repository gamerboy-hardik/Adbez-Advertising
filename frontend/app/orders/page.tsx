'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Receipt, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Copy, Package, ArrowLeft } from 'lucide-react';
import { transactionsApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { formatCurrency, formatDate, truncateId } from '@/lib/utils';
import type { Transaction } from '@/types';
import { useRouter } from 'next/navigation';

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 120, damping: 16 }
  }
} as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore() as any;
  const { info } = useToastStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      info('Please log in to view your orders.');
      router.push('/');
      return;
    }
    transactionsApi.list().then(res => {
      if (res.success && res.data) setOrders(res.data.transactions);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Page Header */}
      <motion.div variants={cardVariants} className="flex items-center gap-4 mb-8">
        <motion.button 
          onClick={() => router.push('/')}
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[var(--border-accent)] transition-all"
        >
          <ArrowLeft size={16} />
        </motion.button>
        <motion.div 
          className="w-10 h-10 rounded-xl bg-primary/10 border border-cyan-500/20 flex items-center justify-center"
          whileHover={{ rotate: 12 }}
        >
          <Receipt size={18} className="text-primary" />
        </motion.div>
        <div>
          <h1 className="font-['Outfit'] text-xl font-bold text-foreground tracking-tight">
            Procurement Ledger
          </h1>
          <p className="text-xs text-muted-foreground">Full record of your acquired infrastructure assets.</p>
        </div>
      </motion.div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <motion.div 
              key={i} 
              className="h-20 rounded-2xl skeleton border border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div 
          variants={cardVariants}
          className="flex flex-col items-center justify-center py-24 gap-4 glass-card rounded-2xl"
        >
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Package size={48} className="text-muted-foreground opacity-30" />
          </motion.div>
          <p className="text-muted-foreground text-sm font-semibold">No orders placed yet.</p>
          <motion.button 
            onClick={() => router.push('/')} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-gradient-to-r from-[var(--accent)] to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-glow"
          >
            Browse Marketplace
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="space-y-3" variants={pageVariants}>
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              variants={cardVariants}
              className="glass-card rounded-2xl overflow-hidden"
              whileHover={{ scale: 1.005, borderColor: 'rgba(var(--accent-rgb), 0.2)' }}
            >
              {/* Order Row */}
              <div
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/50 transition-all duration-300"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-primary tracking-wider">
                      #{truncateId(order.id)}
                    </span>
                    <Badge variant={order.paymentStatus}>{order.paymentStatus}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-['Space_Grotesk'] text-sm font-bold text-foreground">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{order.items?.length || 0} asset(s)</p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedId === order.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </motion.div>
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-border"
                  >
                    <motion.div 
                      className="px-5 py-4 space-y-3"
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    >
                      {order.items?.map(item => (
                        <motion.div 
                          key={item.id} 
                          variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                          className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="text-base">{item.adAccount?.countryFlag || '🏳'}</div>
                            <div>
                              <p className="text-xs font-bold text-foreground">{item.adAccount?.profileName}</p>
                              <p className="text-[10px] text-muted-foreground">{item.adAccount?.platform} · {item.adAccount?.country || 'N/A'}</p>
                            </div>
                          </div>
                          <p className="font-['Space_Grotesk'] text-xs font-bold text-foreground">{formatCurrency(item.price)}</p>
                        </motion.div>
                      ))}

                      {/* View credentials button */}
                      {order.paymentStatus === 'COMPLETED' && (
                        <motion.button
                          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                          onClick={() => router.push(`/checkout/${order.id}`)}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-cyan-300 transition-colors mt-1"
                        >
                          <ExternalLink size={12} />
                          View Delivery Package &amp; Credentials
                        </motion.button>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
