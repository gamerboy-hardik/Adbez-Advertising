'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Wallet, Info, Loader2, Zap } from 'lucide-react';
import { transactionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { logFootprint } from '@/lib/fingerprint';

const presets = [50, 100, 250, 500, 1000];

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ totalCredit: number; bonus: number; invoiceId: string } | null>(null);

  const { updateWallet } = useAuthStore() as any;
  const { success, error } = useToastStore();

  const parsedAmount = parseFloat(amount) || 0;
  const bonus = parsedAmount >= 500 ? parseFloat((parsedAmount * 0.05).toFixed(2)) : 0;
  const totalCredit = parseFloat((parsedAmount + bonus).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount < 1) { error('Minimum top-up is $1.'); return; }
    setLoading(true);
    try {
      logFootprint('TOPUP_INITIATED');
      const res = await transactionsApi.topup(parsedAmount);
      if (!res.success || !res.data) {
        error(res.message || 'Top-up failed.');
        return;
      }
      setResult(res.data);
      // Optimistically update wallet balance
      updateWallet((prev: number) => prev + res.data!.totalCredit);
      success(`Wallet credited with $${res.data.totalCredit.toFixed(2)}!`);
    } catch {
      error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); setResult(null); setAmount(''); }}
      title="Refuel Allocation Wallet"
      subtitle="Inject working balance into your secure enterprise console."
    >
      {result ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto">
            <Wallet size={24} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-['Space_Grotesk'] text-2xl font-bold text-foreground">${result.totalCredit.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${parsedAmount.toFixed(2)} base{result.bonus > 0 ? ` + $${result.bonus.toFixed(2)} bonus` : ''}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{result.invoiceId}</p>
          </div>
          <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            Payment gateway integration pending. Balance update simulated.
          </p>
          <button
            onClick={() => { onClose(); setResult(null); setAmount(''); }}
            className="w-full py-2.5 bg-primary hover:opacity-90 text-foreground font-bold text-xs rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preset Amounts */}
          <div className="grid grid-cols-5 gap-1.5">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={[
                  'py-1.5 rounded-lg text-[10px] font-bold transition-all border',
                  String(p) === amount
                    ? 'bg-primary/10 border-cyan-500/30 text-primary'
                    : 'border-border text-muted-foreground hover:border-border hover:text-foreground bg-transparent',
                ].join(' ')}
              >
                ${p}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Funding Metrics (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter custom amount..."
              min="1"
              step="1"
              className="w-full bg-muted border border-border rounded-xl py-2.5 px-4 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10 transition-all"
            />
          </div>

          {/* Bonus indicator */}
          {parsedAmount >= 500 && (
            <div className="flex items-center gap-2 bg-emerald-500/[0.07] border border-emerald-500/20 rounded-lg px-3 py-2">
              <Zap size={11} className="text-emerald-400 flex-shrink-0" />
              <p className="text-[11px] text-emerald-400">
                <strong>5% bonus</strong> applied → ${bonus.toFixed(2)} extra • Total credit: <strong>${totalCredit.toFixed(2)}</strong>
              </p>
            </div>
          )}

          {/* Info box */}
          <div className="flex items-start gap-2 bg-primary/[0.04] border border-cyan-500/10 rounded-xl px-3 py-2.5">
            <Info size={11} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Top-ups ≥ $500 secure an automatic 5% instant processing liquidity modifier. NowPayments integration coming soon.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || parsedAmount < 1}
            className="w-full py-2.5 bg-primary hover:opacity-90 text-foreground font-bold text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Create Payment Invoice
          </button>
        </form>
      )}
    </Modal>
  );
}
