'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, truncateId } from '@/lib/utils';
import type { DashboardStats, Transaction } from '@/types';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, color = 'text-primary', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[rgba(13,20,38,0.45)] border border-border rounded-2xl p-5 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/[0.04] border border-border flex items-center justify-center">
          <Icon size={15} className={color} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      <p className={`font-['Space_Grotesk'] text-2xl font-bold tracking-tight ${color}`}>{value}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(res => {
      if (res.success && res.data) {
        setStats(res.data.stats);
        setRecentTx(res.data.recentTransactions);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-2xl bg-primary/[0.02] animate-pulse border border-border" />)}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground tracking-tight">Operations Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Real-time infrastructure monitoring &amp; control matrix overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Package}      label="Total Accounts"  value={stats?.totalAccounts  || 0} color="text-primary"    delay={0.05} />
        <StatCard icon={TrendingUp}   label="Available"       value={stats?.availableAccounts || 0} color="text-emerald-400" delay={0.1}  />
        <StatCard icon={Package}      label="Sold"            value={stats?.soldAccounts    || 0} color="text-rose-400"   delay={0.15} />
        <StatCard icon={ShoppingCart} label="Total Orders"    value={stats?.totalTransactions || 0} color="text-violet-400"  delay={0.2}  />
        <StatCard icon={DollarSign}   label="Total Revenue"   value={formatCurrency(stats?.completedRevenue || 0)} color="text-amber-400"  delay={0.25} />
        <StatCard icon={Users}        label="Total Clients"   value={stats?.totalUsers      || 0} color="text-primary"   delay={0.3}  />
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Clock size={12} className="text-primary" />
          Recent Transactions
        </h2>
        <div className="bg-muted/50 border border-border rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Order ID', 'User', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3 bg-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx, idx) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-primary/[0.015] transition-colors"
                >
                  <td className="px-4 py-3.5 font-['Space_Grotesk'] text-xs font-bold text-primary">
                    #{truncateId(tx.id)}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[160px] truncate">
                    {tx.user?.email}
                  </td>
                  <td className="px-4 py-3.5 font-['Space_Grotesk'] text-xs font-bold text-foreground">
                    {formatCurrency(tx.totalAmount)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={tx.paymentStatus}>{tx.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-muted-foreground">{formatDate(tx.createdAt)}</td>
                </motion.tr>
              ))}
              {recentTx.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-muted-foreground">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
