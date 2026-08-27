'use client';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { CheckCircle2, Eye, EyeOff, Copy, Download, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { transactionsApi } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 14 }
  }
} as const;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const { success, error } = useToastStore();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      transactionsApi.get(id).then(res => {
        if (res.success) setData(res.data);
        else error('Could not load order details.');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  const toggleReveal = (assetId: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(assetId) ? next.delete(assetId) : next.add(assetId);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => success('Copied to clipboard!'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <p className="text-muted-foreground">Order not found or access denied.</p>
        <motion.button 
          onClick={() => router.push('/orders')} 
          whileHover={{ scale: 1.05 }}
          className="mt-4 text-primary text-sm hover:underline"
        >
          Back to Orders
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Back */}
      <motion.button
        variants={cardVariants}
        onClick={() => router.push('/orders')}
        whileHover={{ x: -4 }}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={12} /> Back to Ledger
      </motion.button>

      {/* Success Header */}
      <motion.div
        variants={cardVariants}
        className="flex items-center gap-4 mb-8 p-5 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl relative overflow-hidden"
      >
        {/* Shimmer effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />
        <motion.div 
          className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 relative z-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CheckCircle2 size={24} className="text-emerald-400" />
        </motion.div>
        <div className="flex-1 relative z-10">
          <h1 className="font-['Outfit'] text-lg font-bold text-foreground">
            Order Confirmed — Assets Provisioned
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(data.purchasedAt || new Date().toISOString())} · {formatCurrency(data.totalAmount)}
          </p>
        </div>
      </motion.div>

      {/* Credentials */}
      <motion.h2 
        variants={cardVariants}
        className="font-['Outfit'] text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" style={{ boxShadow: '0 0 6px rgba(0,229,255,0.6)' }} />
        Delivery Package — Encrypted Asset Credentials
      </motion.h2>

      <div className="space-y-4">
        {data.assets?.map((asset: any, idx: number) => {
          const isRevealed = revealed.has(asset.id);
          const credsStr = JSON.stringify(asset.credentials, null, 2) || '{}';

          return (
            <motion.div
              key={asset.id}
              variants={cardVariants}
              className="glass-card rounded-2xl overflow-hidden"
              whileHover={{ scale: 1.005 }}
            >
              {/* Asset Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{asset.countryFlag || '🏳'}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{asset.profileName}</p>
                    <p className="text-[10px] text-muted-foreground">{asset.platform} · {asset.country || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => copyToClipboard(credsStr)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-[var(--border-accent)] transition-all"
                    title="Copy credentials"
                  >
                    <Copy size={12} />
                  </motion.button>
                  <motion.button
                    onClick={() => toggleReveal(asset.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-cyan-500/20 transition-all"
                    title={isRevealed ? 'Hide credentials' : 'Reveal credentials'}
                  >
                    {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                  </motion.button>
                </div>
              </div>

              {/* Credentials Body */}
              <div className="relative p-5">
                <pre className={`creds-block transition-all duration-500 ${isRevealed ? '' : 'filter blur-sm select-none'}`}>
                  {credsStr}
                </pre>
                <AnimatePresence>
                  {!isRevealed && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]"
                    >
                      <motion.button
                        onClick={() => toggleReveal(asset.id)}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--accent)] to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-glow"
                      >
                        <Eye size={12} /> Unlock Delivery Package
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Warning */}
      <motion.div 
        variants={cardVariants}
        className="mt-6 p-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl"
      >
        <p className="text-xs text-amber-400 leading-relaxed">
          ⚠️ <strong>Security Notice:</strong> These credentials are displayed once for security purposes. Screenshot or securely store them immediately. AdBez Systems is not responsible for credentials lost after delivery.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function CheckoutDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-muted-foreground text-sm">Loading secure checkout container...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
