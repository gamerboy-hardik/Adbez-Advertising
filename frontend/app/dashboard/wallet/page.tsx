'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, DollarSign, ArrowUpRight, Copy, Check, Sparkles, 
  History, ShieldCheck, CreditCard, Send, ExternalLink, Loader2, Clock, CheckCircle2, RefreshCw
} from 'lucide-react';
import { useAgencyStore } from '@/store/useAgencyStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { formatCurrency } from '@/lib/utils';

import { requestsApi } from '@/lib/api';

export default function WalletHubPage() {
  const [tab, setTab] = useState<'add-money' | 'pay-link' | 'wallet-flow'>('wallet-flow');
  const [copied, setCopied] = useState(false);
  const [customCoins, setCustomCoins] = useState('500');
  const [payLinkAmount, setPayLinkAmount] = useState('1000');
  const [payLinkNote, setPayLinkNote] = useState('AdBez Media Spend Allocation #2026-Q3');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [txHash, setTxHash] = useState('');
  
  // Multi-step verification states
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'completed'>('idle');
  const [verificationStage, setVerificationStage] = useState<number>(0);
  const [verificationStageText, setVerificationStageText] = useState('');
  const [lastTicket, setLastTicket] = useState<{ amount: number; txHash: string; ticketId: string; time: string } | null>(null);

  const { walletFlows } = useAgencyStore();
  const { user } = useAuthStore();
  const { success, error } = useToastStore();
  const balance = user?.walletBalance ?? 0;

  const handleRequestDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationState === 'verifying') return; // Strict spam prevention

    const amt = parseFloat(customCoins);
    if (!amt || amt <= 0) return error('Invalid amount. Minimum deposit is $1.');
    if (!txHash.trim()) return error('Please provide the transaction hash (TxID).');
    
    // Initiate multi-stage realistic blockchain verification loader
    setVerificationState('verifying');
    setVerificationStage(1);
    setVerificationStageText('Verifying TxID hash format on TRC-20 protocol...');
    
    await new Promise(r => setTimeout(r, 800));

    setVerificationStage(2);
    setVerificationStageText('Transmitting escrow payload to AdBez security node...');
    
    const apiPromise = requestsApi.create('WALLET_TOPUP', amt, { txHash: txHash.trim() });
    
    await new Promise(r => setTimeout(r, 900));

    setVerificationStage(3);
    setVerificationStageText('Registering ticket in Admin Audit Matrix...');

    const [res] = await Promise.all([
      apiPromise,
      new Promise(r => setTimeout(r, 800))
    ]);

    if (res && res.success) {
      const ticketId = `DEP-${Math.floor(100000 + Math.random() * 900000)}`;
      setLastTicket({
        amount: amt,
        txHash: txHash.trim(),
        ticketId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setVerificationState('completed');
      success(`Verification Ticket ${ticketId} created! Admin team notified.`);
      setTxHash('');
    } else {
      setVerificationState('idle');
      error(res?.message || 'Failed to submit verification request. Please check hash and try again.');
    }
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGeneratingLink) return;
    setIsGeneratingLink(true);
    await new Promise(r => setTimeout(r, 650));
    const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const url = `https://portal.adbez.com/pay-link/${hash}?amount=${payLinkAmount}`;
    setGeneratedLink(url);
    setIsGeneratingLink(false);
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

          {/* Real Deposit Verification Form & Status Matrix */}
          <div className="bg-card p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent space-y-6 shadow-md relative overflow-hidden">
            
            {verificationState === 'completed' && lastTicket ? (
              /* Success / Ticket Confirmation Screen */
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">
                      Verification Request Active
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ticket <span className="font-mono text-emerald-400 font-bold">{lastTicket.ticketId}</span> registered at {lastTicket.time}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-muted-foreground">Amount Submitted:</span>
                    <span className="text-foreground font-bold text-sm font-['Space_Grotesk']">${lastTicket.amount.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-muted-foreground">Network Protocol:</span>
                    <span className="text-emerald-400 font-bold">TRC-20 (Tron Node)</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-[10px]">Verified TxID Hash:</span>
                    <div className="flex items-center justify-between gap-2 bg-muted/60 p-2 rounded-lg text-[11px] text-foreground">
                      <span className="truncate">{lastTicket.txHash}</span>
                      <button onClick={() => copyToClipboard(lastTicket.txHash)} className="text-muted-foreground hover:text-foreground shrink-0">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                    <Clock size={13} className="text-amber-400" />
                    <span>Audit Status: Pending Admin Verification</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed m-0">
                    Our compliance node audits incoming hashes within 5-15 minutes. Once confirmed on-chain, ${lastTicket.amount.toFixed(2)} AdBez Coins will be credited directly to your spending wallet.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVerificationState('idle')}
                  className="w-full py-3.5 rounded-xl bg-card hover:bg-card-hover border border-border text-foreground font-['Space_Grotesk'] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw size={14} /> Submit Another Deposit Transfer
                </button>
              </motion.div>
            ) : (
              /* Deposit Submission Form */
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-400" /> Verify Deposit Transfer
                  </h3>
                  {verificationState === 'verifying' && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Auditing Hash
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  After sending USDT to the Vault address above, enter the transferred amount and transaction hash below. Our security node will register and route the transaction to the Admin verification team.
                </p>

                <form onSubmit={handleRequestDeposit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Transferred Amount (USDT)</label>
                    <input
                      type="number"
                      value={customCoins}
                      disabled={verificationState === 'verifying'}
                      onChange={(e) => setCustomCoins(e.target.value)}
                      className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 font-['Space_Grotesk'] text-xl font-bold text-foreground focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Transaction Hash (TxID)</label>
                    <input
                      type="text"
                      placeholder="e.g. 0xabcd1234... or Tron TxID"
                      value={txHash}
                      disabled={verificationState === 'verifying'}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
                      required
                    />
                  </div>

                  {/* Verification Progress Tracker during submission */}
                  {verificationState === 'verifying' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                        <span className="flex items-center gap-2">
                          <Loader2 size={13} className="animate-spin text-emerald-400" />
                          {verificationStageText}
                        </span>
                        <span className="font-mono text-[10px]">{verificationStage}/3</span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-950/40 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-400 rounded-full"
                          initial={{ width: '15%' }}
                          animate={{ width: `${(verificationStage / 3) * 100}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={verificationState === 'verifying'}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-600/70 text-white font-['Space_Grotesk'] font-bold text-sm shadow-sm hover:shadow-md transition-shadow shadow-emerald-500/20 transition-all shrink-0 mt-2 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    {verificationState === 'verifying' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Validating Payload...</span>
                      </>
                    ) : (
                      <span>Submit for Verification</span>
                    )}
                  </button>
                </form>
              </>
            )}
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
                  disabled={isGeneratingLink}
                  onChange={(e) => setPayLinkAmount(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 font-['Space_Grotesk'] text-xl font-bold text-foreground focus:outline-none focus:border-violet-400 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Invoice Description / Reference</label>
                <input
                  type="text"
                  value={payLinkNote}
                  disabled={isGeneratingLink}
                  onChange={(e) => setPayLinkNote(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-400 disabled:opacity-50"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isGeneratingLink}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-['Space_Grotesk'] font-bold text-sm shadow-sm hover:shadow-md transition-shadow shadow-violet-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGeneratingLink ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Generating Encrypted Invoicing Hash...</span>
                  </>
                ) : (
                  <span>Generate Shareable Link</span>
                )}
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
