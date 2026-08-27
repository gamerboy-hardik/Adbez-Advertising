'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, ChevronRight, ShieldCheck, DollarSign, Layers, Share2, Sparkles } from 'lucide-react';

interface GuideArticle {
  id: string;
  title: string;
  category: string;
  icon: any;
  iconColor: string;
  summary: string;
  steps: { title: string; desc: string; tip?: string }[];
}

const tutorials: GuideArticle[] = [
  {
    id: 'deposit-funds',
    title: 'How to Deposit Funds & Purchase AdBez Coins',
    category: 'Wallet Matrix',
    icon: DollarSign,
    iconColor: 'text-emerald-400',
    summary: 'Master the instant zero-fee funding workflow via AdBez Coins to top up your campaign advertising budgets without delays.',
    steps: [
      { title: 'Navigate to Wallet & Ledgers', desc: 'Click on the Wallet icon in your left sidebar to enter the dedicated AdBez Coin Control Matrix.' },
      { title: 'Copy Our Direct USDT TRC20 / Bank Vault', desc: 'Under the "Add Money (AdBez Coins)" tab, view our current verified corporate deposit details or reach out to your dedicated account officer.' },
      { title: 'Instant Coins Injection', desc: 'Once confirmed by our treasury, AdBez Coins ($1 = 1 Coin) are instantly loaded into your balance with zero merchant tax deduction.', tip: 'In test mode right now, use the "Sandbox Injector" on the Wallet page to simulate adding up to $2,500 coins instantaneously!' }
    ]
  },
  {
    id: 'apply-account',
    title: 'How to Apply for Whitelisted Advertising Accounts',
    category: 'Account Management',
    icon: Layers,
    iconColor: 'text-primary',
    summary: 'Request enterprise whitelisted accounts on Meta, Google, TikTok, and Bing with daily spending limits up to $100K+.',
    steps: [
      { title: 'Select Your Target Advertising Platform', desc: 'From the dashboard menu, click on Facebook (Meta), Google Ads, TikTok Business, or Bing Ads.' },
      { title: 'Open "Apply Ads Account" Workflow', desc: 'In the left platform navigation bar, click on "Apply Ads Account" to launch the authorization form.' },
      { title: 'Define Spend Cap & Timezone', desc: 'Enter your corporate campaign name, select your required daily spending capacity ($5K to $100K+), and pick your desired billing timezone.' },
      { title: 'Submit & Track Status', desc: 'Upon submission, a refundable $50 setup fee is debited from your AdBez coins balance. You can track real-time approval status in the "Applied Records" ledger!' }
    ]
  },
  {
    id: 'recharge-spend',
    title: 'How to Recharge Ad Account Spend in 2 Seconds',
    category: 'Deposit Management',
    icon: Sparkles,
    iconColor: 'text-amber-400',
    summary: 'Recharge spending credit on active advertising accounts directly from your available AdBez Wallet balance.',
    steps: [
      { title: 'Locate Your Account in Account List', desc: 'Navigate to your desired network (e.g., Facebook) and click the "Deposit" action button next to your active ad account.' },
      { title: 'Input Desired Recharge Amount', desc: 'Enter any top-up amount from $10 upwards using our instant quick-buttons (+100, +250, +500).' },
      { title: 'Review Agency Markup Fee', desc: 'Our transparent markup calculator automatically displays the standard platform fee (e.g. 3%) and shows exact wallet deduction.' },
      { title: 'Confirm Instant Recharge', desc: 'Click confirm! Your ad account available spend increments instantly, and a permanent double-entry record is generated in your Wallet Flow ledger.' }
    ]
  },
  {
    id: 'bm-sharing',
    title: 'How to Share Ad Accounts into Your Business Manager',
    category: 'Permissions & Access',
    icon: Share2,
    iconColor: 'text-violet-400',
    summary: 'Link assigned Meta & TikTok agency accounts straight into your agency Business Manager ID for team collaboration.',
    steps: [
      { title: 'Go to BM Share Log', desc: 'Inside the Facebook (Meta) or TikTok workspace, select "BM Share Log" from the Account Manage section.' },
      { title: 'Input Target BM ID', desc: 'Select your assigned Ad Account ID from the dropdown and type your target Business Manager ID (e.g., 798152282787766).' },
      { title: 'Accept Permissions in BM', desc: 'Our institutional automation pushes the ad account partnership invitation directly to your Business Manager within minutes.' }
    ]
  },
  {
    id: 'after-sale',
    title: 'Balance Transfers & Liquid Refunds',
    category: 'After Sale & Liquidity',
    icon: ShieldCheck,
    iconColor: 'text-sky-400',
    summary: 'Never lose a dollar of unspent ad credit if a campaign pauses or an ad account encounters a review block.',
    steps: [
      { title: 'Instant Balance Transfers', desc: 'Use the "Transfer Balance" module under After Sale to instantaneously move unspent spend from one ad account to another active account with zero transfer fees.' },
      { title: 'Liquid Refunds Back to Wallet', desc: 'Need to withdraw spend? Open "Request Refund" to immediately pull unspent ad budget out of an account and deposit it straight back as AdBez Coins in your main wallet!' }
    ]
  }
];

export default function InteractiveGuidePage() {
  const [activeGuide, setActiveGuide] = useState<GuideArticle>(tutorials[0]);

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-border/50">
        <h1 className="font-['Space_Grotesk'] text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
          <BookOpen className="text-violet-400" size={32} />
          Interactive Agency Onboarding Guide
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Comprehensive operational playbooks and interactive tutorials for scaling media buyers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Tutorial Selector */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-2">
            Available Operational Playbooks
          </p>
          {tutorials.map((item) => {
            const Icon = item.icon;
            const isSelected = activeGuide.id === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveGuide(item)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${isSelected ? 'bg-gradient-to-r from-muted/50 to-muted border-border shadow-sm hover:shadow-md transition-shadow' : 'bg-muted/30 border-border/50 hover:bg-muted/60'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-muted/50 border border-border/50 ${item.iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">{item.category}</span>
                    <h4 className={`font-['Space_Grotesk'] text-sm font-bold truncate mt-0.5 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {item.title}
                    </h4>
                  </div>
                  <ChevronRight size={16} className={`shrink-0 ${isSelected ? 'text-primary translate-x-1' : 'text-muted-foreground/40'} transition-transform`} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Right Interactive Walkthrough Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGuide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card p-8 md:p-10 rounded-3xl border border-border shadow-md space-y-8 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <span className="px-3 py-1 rounded-full bg-muted border border-border text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                  {activeGuide.category}
                </span>
                <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-black text-foreground mt-3 tracking-tight">
                  {activeGuide.title}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">
                  {activeGuide.summary}
                </p>
              </div>

              <div className="space-y-6 pt-4 border-t border-border/50">
                <h4 className="font-['Space_Grotesk'] text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Step-by-Step Execution Workflow
                </h4>

                <div className="space-y-6">
                  {activeGuide.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        {idx !== activeGuide.steps.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/40 to-transparent my-1" />
                        )}
                      </div>

                      <div className="space-y-2 pb-4">
                        <h5 className="font-['Space_Grotesk'] text-base font-bold text-foreground">
                          {step.title}
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.desc}
                        </p>
                        {step.tip && (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-start gap-2">
                            <Sparkles size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span><b>Pro-Tip:</b> {step.tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  Need personalized onboarding assistance or API integration support?
                </div>
                <button onClick={() => alert('Support line connected: Telegram @AdBezSupport')} className="btn-primary px-5 py-2.5 text-xs font-bold shrink-0 shadow-lg shadow-primary/20">
                  Connect 24/7 Support
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
