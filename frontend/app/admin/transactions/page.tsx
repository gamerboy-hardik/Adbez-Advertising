'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useToastStore } from '@/store/toastStore';
import { formatCurrency, formatDate, truncateId } from '@/lib/utils';
import type { Transaction } from '@/types';

const STATUSES = ['PENDING', 'COMPLETED', 'FLAGGED', 'REFUNDED'];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const { success, error } = useToastStore();

  const load = (status?: string) => {
    setLoading(true);
    adminApi.listTransactions(status ? { status } : {}).then(res => {
      if (res.success && res.data) setTransactions(res.data.transactions);
      setLoading(false);
    });
  };

  useEffect(() => { load(filterStatus); }, [filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await adminApi.updateTransactionStatus(id, status);
    if (res.success) {
      success(`Transaction updated to ${status}`);
      setTransactions(txs => txs.map(t => t.id === id ? { ...t, paymentStatus: status as any } : t));
    } else {
      error('Failed to update status.');
    }
    setUpdating(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Transaction Ledger</h1>
        <p className="text-xs text-muted-foreground mt-1">Full financial record of all platform transactions.</p>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={[
              'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all',
              filterStatus === s
                ? 'bg-primary/10 border-cyan-500/30 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-border',
            ].join(' ')}
          >
            {s || 'ALL'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-muted/50 border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Order ID', 'User', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3 bg-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3 bg-primary/[0.03] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
                : transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-border hover:bg-primary/[0.015] transition-colors">
                    <td className="px-4 py-3.5 font-['Space_Grotesk'] text-xs font-bold text-primary whitespace-nowrap">
                      #{truncateId(tx.id)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[140px] truncate">{tx.user?.email}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{tx.items?.length || 0}</td>
                    <td className="px-4 py-3.5 font-['Space_Grotesk'] text-xs font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(tx.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={tx.paymentStatus}>{tx.paymentStatus}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={tx.paymentStatus}
                        onChange={e => updateStatus(tx.id, e.target.value)}
                        disabled={updating === tx.id}
                        className="bg-muted border border-border rounded-lg py-1 px-2 text-[10px] text-muted-foreground focus:outline-none focus:border-cyan-500/30 disabled:opacity-50 transition-all"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              }
              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                    No transactions found.
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
