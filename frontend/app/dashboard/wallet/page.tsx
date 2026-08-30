'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, DollarSign, ArrowUpRight, Copy, Check, Sparkles, 
  History, ShieldCheck, CreditCard, Send, ExternalLink
} from 'lucide-react';
import { useAgencyStore } from '@/store/useAgencyStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { formatCurrency } from '@/lib/utils';

export default function WalletHubPage() {
  const [tab, setTab] = useState<'add-money' | 'pay-link' | 'wallet-flow'>('wallet-flow');
  const [copied, setCopied] = useState(false);
  const [customCoins, setCustomCoins] = useState('500');
  const [payLinkAmount, setPayLinkAmount] = useState('1000');
  const [payLinkNote, setPayLinkNote] = useState('AdBez Media Spend Allocation #2026-Q3');
  const [generatedLink, setGeneratedLink] = useState('');

  const { walletFlows, addWalletDeposit } = useAgencyStore();
  const { user } = useAuthStore();
  const { success } = useToastStore();
  const balance = user?.walletBalance ?? 0;

  const handleSimulateDeposit = (amt: number) => {
    addWalletDeposit(amt, `Direct AdBez Coin Purchase ($${amt})`, 'AdBez Coins Direct Protocol');
    success(`Successfully added $${amt} AdBez Coins to your wallet matrix!`);
    setTab('wallet-flow');
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const url = `https://portal.adbez.com/pay-link/${hash}?amount=${payLinkAmount}`;
    setGeneratedLink(url);
    success('Client payment invoice link generated successfully.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header & Balance Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <h1 className="font-['Space_Grotesk'] text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Wallet className="text-emerald-400" size={32} />
            AdBez Coin & Wallet Matrix
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Recharge your agency spending capacity, generate client payment links, and inspect running ledger audits.
          </p>
        </div>

        <div className="bg-card p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 flex items-center gap-6 shrink-0 shadow-md">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Available Spending Balance</p>
            <h2 className="font-['Space_Grotesk'] text-3xl font-black text-foreground mt-0.5">{formatCurrency(balance)}</h2>
          </div>
          <button onClick={() => setTab('add-money')} className="btn-primary px-5 py-3 text-xs font-bold shrink-0 shadow-lg shadow-primary/20">
            + Add AdBez Coins
          </button>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-4">
        <button
          onClick={() => setTab('add-money')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${tab === 'add-money' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
        >
          Add Money (AdBez Coins)
        </button>
        <button
          onClick={() => setTab('pay-link')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${tab === 'pay-link' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
        >
          Pay Link Generator
        </button>
        <button
          onClick={() => setTab('wallet-flow')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${tab === 'wallet-flow' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 font-black' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
        >
          <span>Wallet Flow (Audit Ledger)</span>
          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px]">{walletFlows.length}</span>
        </button>
      </div>

      {/* TAB 1: ADD MONEY (ADBEZ COINS) */}
      {tab === 'add-money' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-8 rounded-3xl border border-border space-y-6 shadow-md relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <Sparkles className="text-amber-400 w-6 h-6" />
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Direct AdBez Coins Protocol</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To assure zero merchant fee deductions and maximum ad account trust score, AdBez operates on **AdBez Coins ($1.00 USD = 1 AdBez Coin)**. You can fund your account directly via bank transfer, USDT crypto, or wire to our finance team!
            </p>

            <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">USDT TRC20 Deposit Vault:</span>
                <button onClick={() => copyToClipboard('TV9AdBezCorporateMatrix VaultX92901827364')} className="text-primary hover:text-foreground flex items-center gap-1 font-bold">
                  <span>Copy Vault</span> {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              <p className="text-foreground bg-muted p-2 rounded text-[11px] truncate">TV9AdBezCorporateMatrix VaultX92901827364</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <span>⚡ Once transfer is finalized, our Admin team instantly pushes AdBez Coins to your balance via the Admin user control panel!</span>
            </div>
          </div>

          {/* Simulated Instant Test Topup for UI Demonstration */}
          <div className="bg-card p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent space-y-6 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-foreground flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-400" /> Sandbox & Verification Injector
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Test Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For testing and previewing your campaign operations right now, you can directly simulate injecting AdBez Coins into your personal wallet ledger!
            </p>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Simulated Coins Amount ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customCoins}
                  onChange={(e) => setCustomCoins(e.target.value)}
                  className="bg-muted/50 border border-border/50 rounded-xl px-4 py-3 font-['Space_Grotesk'] text-xl font-bold text-foreground flex-1 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSimulateDeposit(parseFloat(customCoins) || 500)}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-['Space_Grotesk'] font-bold text-sm shadow-sm hover:shadow-md transition-shadow shadow-emerald-500/20 transition-all shrink-0"
                >
                  Inject Coins Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => handleSimulateDeposit(500)} className="py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 text-xs font-bold text-foreground transition-colors">
                + $500 AdBez Coins
              </button>
              <button onClick={() => handleSimulateDeposit(2500)} className="py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 text-xs font-bold text-foreground transition-colors">
                + $2,500 VIP Tier Coins
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: PAY LINK GENERATOR */}
      {tab === 'pay-link' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
          <div className="bg-card p-8 rounded-3xl border border-border space-y-6 shadow-md relative bg-gradient-to-br from-violet-600/10 to-transparent">
            <div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Agency Pay Link Generator</h3>
              <p className="text-xs text-muted-foreground mt-1">Generate white-labeled payment recharge invoices to share with your clients or finance departments.</p>
            </div>

            <form onSubmit={handleGenerateLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Invoice Amount ($ USD)</label>
                <input
                  type="number"
                  value={payLinkAmount}
                  onChange={(e) => setPayLinkAmount(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 font-['Space_Grotesk'] text-xl font-bold text-foreground focus:outline-none focus:border-violet-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Invoice Description / Reference</label>
                <input
                  type="text"
                  value={payLinkNote}
                  onChange={(e) => setPayLinkNote(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-400"
                  required
                />
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-['Space_Grotesk'] font-bold text-sm shadow-sm hover:shadow-md transition-shadow shadow-violet-600/20 hover:opacity-95 transition-all">
                Generate Shareable Link
              </button>
            </form>

            {generatedLink && (
              <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 block">Generated Invoice URL</span>
                <div className="flex items-center justify-between gap-4 bg-background p-3 rounded-xl font-mono text-xs text-foreground">
                  <span className="truncate">{generatedLink}</span>
                  <button onClick={() => copyToClipboard(generatedLink)} className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white shrink-0">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 3: WALLET FLOW (LEDGER) */}
      {tab === 'wallet-flow' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Wallet Flow (Double-Entry Ledger)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Complete chronological record of every credit and debit applied to your account.</p>
            </div>
            <button onClick={() => handleSimulateDeposit(100)} className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              + Simulate $100 Credit
            </button>
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Balance Before</th>
                  <th className="px-6 py-4 text-left">Balance After</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs">
                {(walletFlows || []).map((f, index) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-muted-foreground/60">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${f.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'}`}>
                        {f.type === 'Credit' ? '↙ Credit' : '↗ Debit'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground max-w-md">
                      {f.description}
                      <span className="block text-[10px] font-medium text-muted-foreground mt-0.5">{f.category}</span>
                    </td>
                    <td className={`px-6 py-4 font-['Space_Grotesk'] font-bold text-sm ${f.type === 'Credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {f.type === 'Credit' ? '+' : '-'}{formatCurrency(f.amount)}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{formatCurrency(f.balanceBefore)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-foreground">{formatCurrency(f.balanceAfter)}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{f.date}</td>
                  </tr>
                ))}
                {walletFlows.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No financial movements logged yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
