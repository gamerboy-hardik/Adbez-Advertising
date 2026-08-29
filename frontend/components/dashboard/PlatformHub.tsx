'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CreditCard, RefreshCw, Layers, PlusCircle, ArrowRightLeft, 
  DollarSign, CheckCircle2, AlertCircle, Key, Globe, Eye, ChevronRight,
  HelpCircle, Sparkles, Send, History, Building2
} from 'lucide-react';
import { useAgencyStore, AgencyAccount } from '@/store/useAgencyStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

interface PlatformHubProps {
  platform: 'META' | 'GOOGLE' | 'TIKTOK' | 'SNAPCHAT' | 'BING';
  title: string;
  subtitle: string;
  badgeColor?: string;
  glowColor?: string;
}

type TabType = 
  | 'account-list' 
  | 'apply-account' 
  | 'applied-records' 
  | 'bm-share-log' 
  | 'deposit' 
  | 'deposit-report' 
  | 'transfer-balance' 
  | 'refund' 
  | 'refund-report';

export function PlatformHub({ platform, title, subtitle, badgeColor = 'text-primary', glowColor = 'from-primary/20' }: PlatformHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('account-list');
  const [selectedAccForDeposit, setSelectedAccForDeposit] = useState<string>('');
  const [accessModalAccount, setAccessModalAccount] = useState<AgencyAccount | null>(null);

  // Store access
  const { 
    accounts, applications, bmShares, deposits, transfers, refunds, defaultFeePercent,
    applyForAccount, submitBMShare, rechargeAccount, transferBalance, requestRefund 
  } = useAgencyStore();
  const { user } = useAuthStore();
  const { success, error } = useToastStore();

  // Form states
  const [applyBudget, setApplyBudget] = useState('5000');
  const [applyCost, setApplyCost] = useState('30');
  const [applyDeposit, setApplyDeposit] = useState('100');
  const [applyLicense, setApplyLicense] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bmAccountId, setBMAccountId] = useState('');
  const [bmTargetId, setBMTargetId] = useState('');

  const [depositAmount, setDepositAmount] = useState('100');
  
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const [refundAccId, setRefundAccId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  // Filtered store data
  const platformAccounts = (accounts || []).filter(a => a.platform === platform);
  const platformApplications = (applications || []).filter(a => a.platform === platform);
  const platformBMs = (bmShares || []).filter(a => a.platform === platform);
  const platformDeposits = (deposits || []).filter(a => a.platform === platform);
  const platformTransfers = (transfers || []).filter(a => a.platform === platform);
  const platformRefunds = (refunds || []).filter(a => a.platform === platform);

  const currentWalletBalance = user?.walletBalance ?? 294.90;

  // Handlers
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyLicense.trim()) {
      error('Please enter a target License or Corporate Name.');
      return;
    }
    setIsSubmitting(true);
    const cost = parseFloat(applyCost) || 30;
    const deposit = parseFloat(applyDeposit) || 0;
    const res = await applyForAccount(platform, parseFloat(applyBudget) || 5000, cost, deposit, applyLicense);
    setIsSubmitting(false);
    if (res) {
      success(`Application for ${platform} account submitted successfully ($${(cost + deposit * 1.05).toFixed(2)} debited).`);
      setApplyLicense('');
      setActiveTab('applied-records');
    } else {
      const requiredAmount = cost + deposit * 1.05;
      error(`Insufficient AdBez Wallet coins/USD ($${currentWalletBalance.toFixed(2)}). You need at least $${requiredAmount.toFixed(2)} to initiate setup.`);
    }
  };

  const handleBMShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmAccountId || !bmTargetId.trim()) {
      error('Please select an ad account and enter your target BM ID.');
      return;
    }
    submitBMShare(platform, bmAccountId, bmTargetId);
    success('BM Share authorization request dispatched to institutional matrix.');
    setBMTargetId('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedAccForDeposit || platformAccounts[0]?.id;
    if (!targetId) {
      error('No active advertising account selected for top-up.');
      return;
    }
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      error('Please enter a valid recharge amount.');
      return;
    }
    const res = rechargeAccount(targetId, amt);
    if (res.success) {
      success(res.message);
      setActiveTab('deposit-report');
    } else {
      error(res.message);
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFrom || !transferTo || !transferAmount) {
      error('Please select both accounts and input transfer budget.');
      return;
    }
    const res = transferBalance(transferFrom, transferTo, parseFloat(transferAmount));
    if (res.success) {
      success(res.message);
      setTransferAmount('');
    } else {
      error(res.message);
    }
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundAccId || !refundAmount) {
      error('Please select account and refund amount.');
      return;
    }
    const res = requestRefund(refundAccId, parseFloat(refundAmount));
    if (res.success) {
      success(res.message);
      setRefundAmount('');
      setActiveTab('refund-report');
    } else {
      error(res.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* LEFT SUB-NAVIGATION MENU (Agency style) */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="bg-card p-6 rounded-3xl border border-border sticky top-24 shadow-md relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${glowColor} to-transparent blur-3xl rounded-full pointer-events-none opacity-40`} />

          {/* Platform Header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/60 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-border/50 flex items-center justify-center font-['Space_Grotesk'] font-black text-lg text-foreground shadow-lg">
              {platform[0]}
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-base font-bold text-foreground tracking-tight">{title}</h2>
              <p className={`text-[10px] uppercase tracking-widest font-semibold ${badgeColor}`}>Ad Management</p>
            </div>
          </div>

          {/* Nav Categories */}
          <div className="space-y-6 relative z-10 text-xs font-semibold">
            {/* Account Manage */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
                <Layers size={12} className="text-primary" />
                Account Manage
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('account-list')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'account-list' ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-bold border border-primary/30 shadow-lg shadow-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <span>Account List</span>
                  <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-full text-foreground font-bold">{platformAccounts.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('apply-account')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'apply-account' ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-bold border border-primary/30 shadow-lg shadow-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <span>Apply Ads Account</span>
                </button>
                <button
                  onClick={() => setActiveTab('applied-records')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'applied-records' ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-bold border border-primary/30 shadow-lg shadow-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <span>Applied Records</span>
                </button>
                {(platform === 'META' || platform === 'TIKTOK') && (
                  <button
                    onClick={() => setActiveTab('bm-share-log')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'bm-share-log' ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-bold border border-primary/30 shadow-lg shadow-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    <span>BM Share Log</span>
                  </button>
                )}
              </div>
            </div>

            {/* Deposit Manage */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
                <DollarSign size={12} className="text-emerald-400" />
                Deposit Manage
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'deposit' ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 font-bold border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <span>Recharge (Deposit)</span>
                </button>
                <button
                  onClick={() => setActiveTab('deposit-report')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'deposit-report' ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 font-bold border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <span>Deposit Report</span>
                </button>
              </div>
            </div>

            {/* After Sale */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
                <RefreshCw size={12} className="text-violet-400" />
                After Sale & Support
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('transfer-balance')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'transfer-balance' ? 'bg-gradient-to-r from-violet-500/20 to-violet-500/5 text-violet-400 font-bold border border-violet-500/30 shadow-lg shadow-violet-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <span>Transfer Balance</span>
                </button>
                <button
                  onClick={() => setActiveTab('refund')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'refund' ? 'bg-gradient-to-r from-violet-500/20 to-violet-500/5 text-violet-400 font-bold border border-violet-500/30 shadow-lg shadow-violet-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <span>Request Refund</span>
                </button>
                <button
                  onClick={() => setActiveTab('refund-report')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${activeTab === 'refund-report' ? 'bg-gradient-to-r from-violet-500/20 to-violet-500/5 text-violet-400 font-bold border border-violet-500/30 shadow-lg shadow-violet-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <span>Refund Report</span>
                </button>
              </div>
            </div>

            {/* Wallet Quick card */}
            <div className="pt-4 border-t border-border/60">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 to-violet-600/10 border border-primary/20 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <span>AdBez Wallet Balance</span>
                  <span className="text-emerald-400 font-['Space_Grotesk'] text-sm font-black">{formatCurrency(currentWalletBalance)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                  Need more balance? Add funds directly from your <b>Wallet Hub</b>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 min-w-0">
        {/* VIEW 1: ACCOUNT LIST */}
        {activeTab === 'account-list' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">Your Ad Accounts</h1>
                <p className="text-xs text-muted-foreground mt-1">Institutional matrix of active {subtitle} advertising accounts under your agency license.</p>
              </div>
              <button
                onClick={() => setActiveTab('apply-account')}
                className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-primary/20"
              >
                <PlusCircle size={14} /> Apply New Account
              </button>
            </div>

            {platformAccounts.length === 0 ? (
              <div className="bg-card p-12 rounded-3xl text-center border border-border flex flex-col items-center">
                <Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-foreground">No {platform} accounts active</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">You haven't requested any agency advertising accounts for this network yet.</p>
                <button onClick={() => setActiveTab('apply-account')} className="btn-primary px-6 py-2.5 text-xs">
                  Apply for first account now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {platformAccounts.map((acc, idx) => (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card p-6 rounded-3xl border border-border hover:border-primary/40 transition-all shadow-sm hover:shadow-md transition-shadow relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/10 via-transparent to-transparent pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      {/* Left info */}
                      <div className="space-y-2 max-w-md">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-['Space_Grotesk'] text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {acc.accountName}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${acc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                            ● {acc.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-3">
                          <span>ID: <b className="text-foreground font-mono">{acc.accountId}</b></span>
                          <span>•</span>
                          <span>License: <b className="text-primary font-medium">{acc.licenseName}</b></span>
                        </p>
                        <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground/80">
                          <span className="flex items-center gap-1"><Key size={12} className="text-primary" /> {acc.loginEmail}</span>
                          <span className="flex items-center gap-1"><Globe size={12} className="text-violet-400" /> Proxy: US-High Speed</span>
                        </div>
                      </div>

                      {/* Center balance stats */}
                      <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/50/70 border border-border shrink-0">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Available Spend</p>
                          <p className="font-['Space_Grotesk'] text-xl font-black text-emerald-400 mt-0.5">{formatCurrency(acc.currentBalance)}</p>
                        </div>
                        <div className="h-8 w-px bg-muted/50" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Spend Limit</p>
                          <p className="font-['Space_Grotesk'] text-base font-bold text-foreground mt-0.5">${(acc.spendLimit / 1000).toFixed(0)}K / Day</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => setAccessModalAccount(acc)}
                          className="px-4 py-2.5 text-xs font-bold bg-muted/50 hover:bg-muted text-foreground border border-border/50 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Eye size={14} className="text-primary" /> Access
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccForDeposit(acc.id);
                            setActiveTab('deposit');
                          }}
                          disabled={acc.status !== 'Active'}
                          className="px-4 py-2.5 text-xs font-bold btn-primary rounded-xl flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <DollarSign size={14} /> Deposit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2: APPLY ADS ACCOUNT */}
        {activeTab === 'apply-account' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">Apply for Institutional {platform} Account</h1>
              <p className="text-xs text-muted-foreground mt-1">Request high-limit Whitelisted accounts directly from AdBez agency partners.</p>
            </div>

            <form onSubmit={handleApply} className="bg-card p-8 rounded-3xl border border-border space-y-6 relative shadow-md">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 flex items-start gap-3.5">
                <Sparkles size={20} className="text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-foreground">Instant Application Authorization</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Application requires an upfront account cost plus an initial deposit. An agency setup fee of <b>5%</b> applies to the deposit amount. This total will be debited from your AdBez wallet.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Target Corporate License / Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arshad X Growwzone Scaling 01"
                  value={applyLicense}
                  onChange={(e) => setApplyLicense(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Requested Daily Spend Limit</label>
                  <select
                    value={applyBudget}
                    onChange={(e) => setApplyBudget(e.target.value)}
                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="5000">$5,000 / Day (Standard Tier)</option>
                    <option value="25000">$25,000 / Day (Scale Tier)</option>
                    <option value="100000">$100,000+ / Day (Uncapped Whitelisted)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cost of ads account</label>
                  <select
                    value={applyCost}
                    onChange={(e) => setApplyCost(e.target.value)}
                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="30">$30.00</option>
                    <option value="60">$60.00</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Percentage</label>
                  <input
                    type="text"
                    value="5% Fixed"
                    readOnly
                    className="w-full bg-muted/30 border border-border/30 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Deposit Amount ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={applyDeposit}
                    onChange={(e) => setApplyDeposit(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2 text-xs font-medium">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Account Cost:</span>
                  <span className="text-foreground font-mono font-bold">${parseFloat(applyCost || '0').toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Initial Deposit:</span>
                  <span className="text-foreground font-mono font-bold">${parseFloat(applyDeposit || '0').toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-amber-400">
                  <span>Deposit Fee (5%):</span>
                  <span className="font-mono font-bold">${(parseFloat(applyDeposit || '0') * 0.05).toFixed(2)}</span>
                </div>
                <div className="h-px bg-muted/50 my-1" />
                <div className="flex items-center justify-between font-['Space_Grotesk'] text-sm font-black text-emerald-400 pt-1">
                  <span>Total Deducted:</span>
                  <span>${(parseFloat(applyCost || '0') + parseFloat(applyDeposit || '0') * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-muted-foreground">Wallet Balance: </span>
                  <b className={currentWalletBalance >= 50 ? 'text-emerald-400 font-mono text-sm' : 'text-rose-400 font-mono text-sm'}>
                    {formatCurrency(currentWalletBalance)}
                  </b>
                </div>
                <button type="submit" disabled={isSubmitting || currentWalletBalance < (parseFloat(applyCost || '0') + parseFloat(applyDeposit || '0') * 1.05)} className="btn-primary px-8 py-3.5 text-sm font-bold shadow-sm hover:shadow-md transition-shadow shadow-primary/20 disabled:opacity-40 flex items-center gap-2">
                  <Send size={16} /> Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* VIEW 3: APPLIED RECORDS */}
        {activeTab === 'applied-records' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">Application Records</h1>
              <p className="text-xs text-muted-foreground mt-1">Audit trail of all requested {platform} advertising accounts.</p>
            </div>

            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50/80 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <th className="px-6 py-4 text-left">Apply ID</th>
                    <th className="px-6 py-4 text-left">License Name</th>
                    <th className="px-6 py-4 text-left">Requested Limit</th>
                    <th className="px-6 py-4 text-left">Cost / Deposit</th>
                    <th className="px-6 py-4 text-left">Date Applied</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {platformApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">{app.id}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{app.licenseName}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">${app.budgetAllocation.toLocaleString()} / day</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {app.cost ? `$${app.cost} / $${app.depositAmount}` : app.timezone}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{app.appliedDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase border ${app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'}`}>
                          ● {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {platformApplications.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">No applications logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: BM SHARE LOG */}
        {activeTab === 'bm-share-log' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">BM Share History & Request</h1>
              <p className="text-xs text-muted-foreground mt-1">Request sharing your active advertising accounts directly into your Meta/TikTok Business Manager.</p>
            </div>

            {/* Share Form */}
            <form onSubmit={handleBMShare} className="bg-card p-6 rounded-3xl border border-border space-y-4 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-primary/[0.03] to-transparent">
              <h3 className="font-['Space_Grotesk'] text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 size={16} className="text-primary" /> Request New Business Manager Connection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">Select Ad Account</label>
                  <select
                    value={bmAccountId}
                    onChange={(e) => setBMAccountId(e.target.value)}
                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Choose Active {platform} Account --</option>
                    {platformAccounts.map(a => (
                      <option key={a.id} value={a.accountId}>{a.accountName} ({a.accountId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">Target Business Manager ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 798152282787766"
                    value={bmTargetId}
                    onChange={(e) => setBMTargetId(e.target.value)}
                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary px-6 py-2.5 text-xs font-bold">
                  Submit BM Share Request
                </button>
              </div>
            </form>

            {/* History Table */}
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50/80 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <th className="px-6 py-4 text-left">Apply ID</th>
                    <th className="px-6 py-4 text-left">Ad Account</th>
                    <th className="px-6 py-4 text-left">Target BM ID</th>
                    <th className="px-6 py-4 text-left">Request Time</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {platformBMs.map(b => (
                    <tr key={b.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">{b.id}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{b.adAccountName} <span className="text-muted-foreground/60 block text-[10px] font-mono">{b.adAccountId}</span></td>
                      <td className="px-6 py-4 font-mono text-violet-400 font-bold">{b.bmId}</td>
                      <td className="px-6 py-4 text-muted-foreground">{b.requestTime}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ● {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {platformBMs.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No BM sharing records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* VIEW 5: RECHARGE DEPOSIT ENGINE */}
        {activeTab === 'deposit' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">Recharge {platform} Ad Account</h1>
              <p className="text-xs text-muted-foreground mt-1">Top up advertising budget instantly from your AdBez Wallet Coins/Credit.</p>
            </div>

            <form onSubmit={handleDepositSubmit} className="bg-card p-8 rounded-3xl border border-border space-y-6 relative shadow-md bg-gradient-to-br from-emerald-500/[0.02] to-transparent">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Target Account to Top-up</label>
                <select
                  value={selectedAccForDeposit || (platformAccounts[0]?.id || '')}
                  onChange={(e) => setSelectedAccForDeposit(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary font-bold"
                >
                  {platformAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.accountName} (Balance: ${a.currentBalance})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Deposit Amount ($ USD / AdBez Coins)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-['Space_Grotesk'] text-lg font-black text-emerald-400">$</span>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-muted/50 border border-border/50 rounded-xl pl-9 pr-4 py-3.5 font-['Space_Grotesk'] text-2xl font-black text-foreground focus:outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  {[50, 100, 250, 500, 1000].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setDepositAmount(val.toString())}
                      className="flex-1 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors border border-border/50"
                    >
                      +${val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown Card */}
              <div className="p-5 rounded-2xl bg-muted/50 border border-border space-y-2.5 text-xs font-medium">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Requested Ad Budget:</span>
                  <span className="text-foreground font-mono font-bold">${parseFloat(depositAmount || '0').toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-amber-400">
                  <span>Agency Top-up Fee ({defaultFeePercent}%):</span>
                  <span className="font-mono font-bold">${((parseFloat(depositAmount || '0') * defaultFeePercent) / 100).toFixed(2)}</span>
                </div>
                <div className="h-px bg-muted/50 my-1" />
                <div className="flex items-center justify-between font-['Space_Grotesk'] text-base font-black text-emerald-400 pt-1">
                  <span>Total Deducted from Wallet:</span>
                  <span>${(parseFloat(depositAmount || '0') * (1 + defaultFeePercent / 100)).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border/50">
                <div className="text-xs">
                  <span className="text-muted-foreground">Wallet Available: </span>
                  <b className={currentWalletBalance >= (parseFloat(depositAmount || '0') * 1.03) ? 'text-emerald-400 font-mono text-sm font-bold' : 'text-rose-400 font-mono text-sm font-bold'}>
                    {formatCurrency(currentWalletBalance)}
                  </b>
                </div>
                <button 
                  type="submit" 
                  disabled={currentWalletBalance < (parseFloat(depositAmount || '0') * 1.03)}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-['Space_Grotesk'] font-bold text-sm shadow-sm hover:shadow-md transition-shadow shadow-emerald-500/20 hover:opacity-95 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <DollarSign size={18} /> Confirm Instant Recharge
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* VIEW 6: DEPOSIT REPORT */}
        {activeTab === 'deposit-report' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">Recharge Deposit History</h1>
              <p className="text-xs text-muted-foreground mt-1">Historical ledger of all top-up requests and agency markup fees for {platform}.</p>
            </div>

            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50/80 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <th className="px-6 py-4 text-left">Apply ID</th>
                    <th className="px-6 py-4 text-left">Ads Account</th>
                    <th className="px-6 py-4 text-left">Deposit</th>
                    <th className="px-6 py-4 text-left">Fee</th>
                    <th className="px-6 py-4 text-left">Total Charged</th>
                    <th className="px-6 py-4 text-left">Request Time</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {platformDeposits.map(d => (
                    <tr key={d.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">{d.id}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{d.accountName} <span className="block text-[10px] text-muted-foreground/60 font-mono">{d.accountId}</span></td>
                      <td className="px-6 py-4 text-emerald-400 font-bold font-mono">${d.depositAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-amber-400 font-medium">${d.feeAmount.toFixed(2)} <span className="text-[10px]">({d.feePercent}%)</span></td>
                      <td className="px-6 py-4 font-['Space_Grotesk'] font-bold text-foreground text-sm">${d.totalCharged.toFixed(2)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{d.requestTime}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ● {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {platformDeposits.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No deposit history recorded for this network.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* VIEW 7: TRANSFER BALANCE */}
        {activeTab === 'transfer-balance' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">Transfer Account Balance</h1>
              <p className="text-xs text-muted-foreground mt-1">Move unspent advertising budget between your active {platform} accounts instantaneously.</p>
            </div>

            <form onSubmit={handleTransferSubmit} className="bg-card p-8 rounded-3xl border border-border space-y-6 shadow-md bg-gradient-to-br from-violet-500/[0.03] to-transparent">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">From Ad Account (Source)</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-400"
                  required
                >
                  <option value="">-- Choose Source Account --</option>
                  {platformAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.accountName} (Available: ${a.currentBalance})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center -my-2">
                <div className="p-2.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">
                  <ArrowRightLeft size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">To Ad Account (Destination)</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-violet-400"
                  required
                >
                  <option value="">-- Choose Destination Account --</option>
                  {platformAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.accountName} (Current: ${a.currentBalance})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Transfer Amount ($ USD)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 font-['Space_Grotesk'] text-xl font-bold text-foreground focus:outline-none focus:border-violet-400"
                  required
                />
              </div>

              <button type="submit" className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-['Space_Grotesk'] font-bold text-sm shadow-sm hover:shadow-md transition-shadow shadow-violet-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2">
                <ArrowRightLeft size={18} /> Execute Instant Transfer
              </button>
            </form>
          </motion.div>
        )}

        {/* VIEW 8: REQUEST REFUND */}
        {activeTab === 'refund' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">Ads Refund Request</h1>
              <p className="text-xs text-muted-foreground mt-1">Liquidate remaining ad account balance directly back into your AdBez Wallet Balance.</p>
            </div>

            <form onSubmit={handleRefundSubmit} className="bg-card p-8 rounded-3xl border border-border space-y-6 shadow-md bg-gradient-to-br from-primary/[0.03] to-transparent">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Ad Account to Refund</label>
                <select
                  value={refundAccId}
                  onChange={(e) => setRefundAccId(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary font-bold"
                  required
                >
                  <option value="">-- Choose Account --</option>
                  {platformAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.accountName} (Available: ${a.currentBalance})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Refund Money ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="$ Enter Amount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 font-['Space_Grotesk'] text-xl font-bold text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <button type="submit" className="w-full py-4 rounded-2xl btn-primary text-white font-['Space_Grotesk'] font-bold text-sm shadow-sm hover:shadow-md transition-shadow shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2">
                <RefreshCw size={18} /> Submit Liquid Refund to Wallet
              </button>
            </form>
          </motion.div>
        )}

        {/* VIEW 9: REFUND REPORT */}
        {activeTab === 'refund-report' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-black text-foreground tracking-tight">Refund Request Log</h1>
              <p className="text-xs text-muted-foreground mt-1">Audit log of ad account balances refunded back into main wallet credit.</p>
            </div>

            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50/80 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <th className="px-6 py-4 text-left">Refund ID</th>
                    <th className="px-6 py-4 text-left">Ads Account</th>
                    <th className="px-6 py-4 text-left">Refund Amount</th>
                    <th className="px-6 py-4 text-left">Request Time</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {platformRefunds.map(r => (
                    <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">{r.id}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{r.accountName}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold font-mono text-sm">+${r.refundAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{r.requestTime}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ● {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {platformRefunds.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No refund events logged yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* ACCESS CREDENTIALS MODAL */}
      <AnimatePresence>
        {accessModalAccount && (
          <Modal isOpen={!!accessModalAccount} onClose={() => setAccessModalAccount(null)} title="Ad Account Security & Credentials">
            <div className="space-y-4 p-2">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Account ID</span>
                  <span className="text-primary font-bold text-sm">{accessModalAccount.accountId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Login User / Admin Profile</span>
                  <span className="text-foreground font-bold">{accessModalAccount.loginEmail || 'assigned.agency@adbez.com'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Dedicated Proxy (High-Speed Residential)</span>
                  <span className="text-violet-400 font-semibold">{accessModalAccount.proxyIp || '198.51.100.24:8080'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Business License</span>
                  <span className="text-emerald-400">{accessModalAccount.licenseName}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-muted-foreground leading-relaxed">
                🛡️ <b>Security Advice:</b> Always connect through your designated proxy IP before launching ads in Business Suite to maintain 100% account trust score.
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setAccessModalAccount(null)} className="btn-primary px-6 py-2 text-xs font-bold">
                  Close Security Box
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
