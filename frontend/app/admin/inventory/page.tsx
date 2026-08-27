'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Upload, Search } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { AccountModal } from '@/components/admin/AccountModal';
import { useToastStore } from '@/store/toastStore';
import { formatCurrency } from '@/lib/utils';
import type { AdAccount } from '@/types';

export default function InventoryPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editAccount, setEditAccount] = useState<AdAccount | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { success, error } = useToastStore();

  const load = () => {
    adminApi.listAccounts({ limit: 100 }).then(res => {
      if (res && res.success && res.data && Array.isArray(res.data.accounts)) {
        setAccounts(res.data.accounts);
      } else if (res && res.data && Array.isArray(res.data)) {
        setAccounts(res.data as any);
      } else {
        setAccounts([]);
      }
      setLoading(false);
    }).catch(() => {
      setAccounts([]);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This is irreversible.`)) return;
    setDeleting(id);
    const res = await adminApi.deleteAccount(id);
    if (res && res.success) {
      success('Account deleted.');
      setAccounts(a => (a || []).filter(x => x.id !== id));
    } else {
      error('Failed to delete account.');
    }
    setDeleting(null);
  };

  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const filtered = safeAccounts.filter(a =>
    (a?.profileName || '').toLowerCase().includes((search || '').toLowerCase()) ||
    (a?.platform || '').toLowerCase().includes((search || '').toLowerCase()) ||
    (a?.category || '').toLowerCase().includes((search || '').toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Inventory Control Matrix</h1>
          <p className="text-xs text-muted-foreground mt-1">{safeAccounts.length} total assets in database</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground border border-border rounded-xl hover:text-foreground hover:border-primary/50 transition-all">
            <Upload size={12} /> Import CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-primary hover:opacity-90 rounded-xl transition-all"
          >
            <Plus size={12} /> Add Account
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter inventory..."
          className="w-full bg-card border border-border rounded-xl py-2 pl-8 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Asset', 'Platform', 'Category', 'Country', 'Price', 'Status', 'Credentials', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3 bg-muted/30 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3 bg-primary/10 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
                : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center">
                          <Search size={20} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">No assets found</p>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          There are no assets matching your filter criteria, or the database is currently empty.
                        </p>
                      </div>
                    </td>
                  </tr>
                )
                : filtered.map(account => (
                  <motion.tr
                    key={account.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{account.countryFlag || '🏳'}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{account.profileName}</p>
                          {account.isFeatured && (
                            <span className="text-[9px] text-primary">✦ Premium</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{account.platform}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{account.category}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{account.country || '-'}</td>
                    <td className="px-4 py-3.5 font-['Space_Grotesk'] text-xs font-bold text-foreground">
                      {formatCurrency(account.price)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={account.status}>{account.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        {account.hasCredentials && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Keys</span>
                        )}
                        {account.hasProxy && (
                          <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full">Proxy</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setEditAccount(account)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id, account.profileName)}
                          disabled={deleting === account.id}
                          className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={11} />
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

      {/* Add / Edit Account Modal */}
      <AccountModal 
        isOpen={showAdd || !!editAccount} 
        editData={editAccount}
        onClose={() => { setShowAdd(false); setEditAccount(null); }} 
        onSuccess={() => { setShowAdd(false); setEditAccount(null); load(); }} 
      />
    </div>
  );
}
