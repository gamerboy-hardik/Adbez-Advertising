'use client';
import { useAgencyStore } from '@/store/useAgencyStore';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderHistoryPage() {
  const { applications, walletFlows } = useAgencyStore();

  // Combine and sort by date descending
  const history = [
    ...(applications || []).map(app => ({
      id: app.id,
      type: 'ACCOUNT_APPLICATION',
      title: `Account Application - ${app.platform}`,
      amount: (app.cost || 0) + ((app.depositAmount || 0) * (1 + (app.feePercentage || 5) / 100)),
      status: app.status,
      date: app.appliedDate,
      details: `Budget: ${formatCurrency(app.budgetAllocation)} | Cost: ${formatCurrency(app.cost || 0)} | Deposit: ${formatCurrency(app.depositAmount || 0)}`,
    })),
    ...(walletFlows || []).map(flow => ({
      id: flow.id,
      type: 'WALLET_TRANSACTION',
      title: flow.description,
      amount: flow.amount,
      status: 'COMPLETED',
      date: flow.date,
      details: `${flow.type === 'Credit' ? '+' : '-'}${formatCurrency(flow.amount)} (${flow.category})`,
      flowType: flow.type,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">Order & Activity History</h1>
          <p className="text-muted-foreground text-sm">Track all your account requests, purchases, and wallet top-ups.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No order history found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={item.id}
              className="bg-card border border-border p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-lg">{item.title}</h3>
                  <Badge variant={
                    item.status === 'Approved' || item.status === 'COMPLETED' ? 'success' :
                    item.status === 'Pending' ? 'warning' : 'destructive'
                  }>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.details}</p>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(item.date)}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold font-mono ${item.type === 'WALLET_TRANSACTION' && (item as any).flowType === 'Debit' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {item.type === 'WALLET_TRANSACTION' ? ((item as any).flowType === 'Debit' ? '-' : '+') : ''}
                  {formatCurrency(item.amount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">{item.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
