'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Upload, Search, Package, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useToastStore } from '@/store/toastStore';
import { formatCurrency, cn } from '@/lib/utils';
import type { AdAccount, DashboardStats } from '@/types';
import { AccountModal } from './AccountModal';

export function AdminOverviewDashboard() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<AdAccount | null>(null);
  const { success, error } = useToastStore();

  const load = async () => {
    setLoading(true);
    try {
      const [accountsRes, statsRes] = await Promise.all([
        adminApi.listAccounts({ limit: 500 }),
        adminApi.getStats()
      ]);
      
      if (accountsRes.success && accountsRes.data) {
        setAccounts(accountsRes.data.accounts);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data.stats);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This is irreversible.`)) return;
    setDeleting(id);
    const res = await adminApi.deleteAccount(id);
    if (res.success) {
      success('Account deleted.');
      setAccounts(a => a.filter(x => x.id !== id));
      if (stats) {
        setStats({ ...stats, totalAccounts: stats.totalAccounts - 1, availableAccounts: stats.availableAccounts - 1 });
      }
    } else {
      error('Failed to delete account.');
    }
    setDeleting(null);
  };

  const filtered = accounts.filter(a =>
    a.profileName.toLowerCase().includes(search.toLowerCase()) ||
    a.platform.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-8 pb-10"
    >
      {/* Overview Stats Cards */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Master Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Listed', val: stats?.totalAccounts || 0, icon: Package, color: 'text-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
            { label: 'Total Sold', val: stats?.soldAccounts || 0, icon: CheckCircle2, color: 'text-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
            { label: 'Remaining Stock', val: stats?.availableAccounts || 0, icon: TrendingUp, color: 'text-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
            { label: 'Total Revenue', val: formatCurrency(stats?.completedRevenue || 0), icon: DollarSign, color: 'text-primary', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: "spring", stiffness: 300 }}
              className={cn("bg-card glow-border relative overflow-hidden rounded-2xl p-6 flex items-center justify-between group transition-all duration-300", stat.glow)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">{stat.label}</p>
                <p className="font-display text-4xl font-black text-foreground tracking-tight drop-shadow-sm">{stat.val}</p>
              </div>
              <div className={`relative z-10 w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center ${stat.color} shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Inventory Control Matrix */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            Inventory Matrix
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative max-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter matrix..."
                className="w-full bg-card border border-border rounded-xl py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all shadow-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground bg-card border border-border rounded-xl hover:text-foreground hover:border-black/20 dark:hover:border-border/50 transition-all shadow-sm">
              <Upload size={14} /> <span className="hidden sm:inline">Import CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-3xl overflow-hidden shadow-md relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="overflow-x-auto relative z-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/50 dark:bg-muted/50 backdrop-blur-md">
                  {['Asset', 'Platform', 'Category', 'Country', 'Price', 'Status', 'Secure Data', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground px-6 py-5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-muted/50 dark:bg-muted/50 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                  : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-muted/50 dark:bg-muted/50 flex items-center justify-center border border-border shadow-inner mb-2">
                            <Package size={28} className="text-muted-foreground/50" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground mb-1">No Assets Found</h3>
                            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                              Your inventory matrix is currently empty. Click the "Add" button in the navigation bar to securely import your first asset.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((account, idx) => (
                    <motion.tr
                      key={account.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border hover:bg-muted/50 dark:hover:bg-muted transition-colors group"
                    >
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted/50 dark:bg-muted/50 border border-border group-hover:border-black/10 dark:group-hover:border-border/50 transition-colors flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                            {account.countryFlag || '🏳'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{account.profileName}</p>
                            {account.isFeatured && (
                              <span className="text-[10px] text-cyan-400 font-bold tracking-wide">Premium Asset</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">{account.platform}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{account.category}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-semibold">{account.country || '-'}</td>
                      <td className="px-6 py-4 font-display text-sm font-bold text-foreground group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                        {formatCurrency(account.price)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={account.status}>{account.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {account.hasCredentials && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">Keys</span>
                          )}
                          {account.hasProxy && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-semibold">Proxy</span>
                          )}
                          {!account.hasCredentials && !account.hasProxy && <span className="text-muted-foreground/30 text-xs font-mono">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={() => setEditingAccount(account)} className="p-2 text-muted-foreground bg-card border border-border hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-500 dark:hover:text-cyan-400 rounded-lg transition-all shadow-sm active:scale-95">
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id, account.profileName)}
                            disabled={deleting === account.id}
                            className="p-2 text-muted-foreground bg-card border border-border hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-40"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {editingAccount && (
        <AccountModal
          isOpen={true}
          onClose={() => setEditingAccount(null)}
          onSuccess={() => {
            setEditingAccount(null);
            load(); // reload the data
          }}
          defaultCategory={editingAccount.category as any}
          editData={editingAccount}
        />
      )}
    </motion.div>
  );
}
