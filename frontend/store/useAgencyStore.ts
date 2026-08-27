'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

export interface AgencyAccount {
  id: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK' | 'SNAPCHAT' | 'BING';
  accountName: string;
  accountId: string;
  status: 'Active' | 'Under Review' | 'Disabled' | 'Payment Error';
  spendLimit: number;
  currentBalance: number;
  licenseName: string;
  createdAt: string;
  loginEmail?: string;
  proxyIp?: string;
}

export interface AccountApplication {
  id: string;
  platform: string;
  budgetAllocation: number;
  timezone: string;
  licenseName: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedDate: string;
  reason?: string;
}

export interface BMShareRecord {
  id: string;
  platform: string;
  adAccountName: string;
  adAccountId: string;
  bmId: string;
  requestTime: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  reason?: string;
}

export interface DepositRecord {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  depositAmount: number;
  feePercent: number;
  feeAmount: number;
  totalCharged: number;
  requestTime: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface TransferRecord {
  id: string;
  platform: string;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  transferAmount: number;
  requestTime: string;
  status: 'Approved' | 'Pending';
}

export interface RefundRecord {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  refundAmount: number;
  requestTime: string;
  status: 'Approved' | 'Pending';
}

export interface WalletFlowItem {
  id: string;
  type: 'Credit' | 'Debit';
  description: string;
  category: 'Deposit' | 'Account Deposit' | 'Refund' | 'Ad Account Apply' | 'Balance Transfer';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  date: string;
}

interface AgencyStore {
  accounts: AgencyAccount[];
  applications: AccountApplication[];
  bmShares: BMShareRecord[];
  deposits: DepositRecord[];
  transfers: TransferRecord[];
  refunds: RefundRecord[];
  walletFlows: WalletFlowItem[];
  defaultFeePercent: number;
  
  // Actions
  setDefaultFeePercent: (percent: number) => void;
  applyForAccount: (platform: string, budget: number, timezone: string, license: string) => Promise<boolean>;
  submitBMShare: (platform: string, accountId: string, bmId: string) => void;
  rechargeAccount: (accountId: string, amount: number) => { success: boolean; message: string };
  transferBalance: (fromId: string, toId: string, amount: number) => { success: boolean; message: string };
  requestRefund: (accountId: string, amount: number) => { success: boolean; message: string };
  addWalletDeposit: (amount: number, remarks?: string, method?: string) => void;
}

const INITIAL_ACCOUNTS: AgencyAccount[] = [
  {
    id: 'acc_meta_1',
    platform: 'META',
    accountName: 'ArshadXGrowwzone Agency',
    accountId: '1167979775398325',
    status: 'Active',
    spendLimit: 50000,
    currentBalance: 1240.50,
    licenseName: 'N/A',
    createdAt: '2026-04-12',
    loginEmail: 'agency.client.01@adbez.com',
    proxyIp: '198.51.100.24:8080 (US-VA)'
  },
  {
    id: 'acc_meta_2',
    platform: 'META',
    accountName: 'Growwzone X Arshad 01',
    accountId: '2380795785666325',
    status: 'Active',
    spendLimit: 100000,
    currentBalance: 4890.00,
    licenseName: 'Arshad_1804',
    createdAt: '2026-04-18',
    loginEmail: 'agency.client.02@adbez.com',
    proxyIp: '198.51.100.29:8080 (US-CA)'
  },
  {
    id: 'acc_google_1',
    platform: 'GOOGLE',
    accountName: 'Google Ads MCC Enterprise #104',
    accountId: '849-291-0984',
    status: 'Active',
    spendLimit: 150000,
    currentBalance: 8450.20,
    licenseName: 'AdBez-Corporate',
    createdAt: '2026-05-01',
    loginEmail: 'g-mcc.104@adbez.net',
    proxyIp: '198.51.100.88:3128 (US-NY)'
  },
  {
    id: 'acc_tiktok_1',
    platform: 'TIKTOK',
    accountName: 'TikTok BC Verified SEA #02',
    accountId: '7291884750192837',
    status: 'Active',
    spendLimit: 25000,
    currentBalance: 890.00,
    licenseName: 'SEA-Agency',
    createdAt: '2026-05-10',
    loginEmail: 'tiktok.bc@adbez.com',
    proxyIp: '103.21.244.12:8080 (SG)'
  },
  {
    id: 'acc_meta_3',
    platform: 'META',
    accountName: 'AdBez X Legacy Campaign #09',
    accountId: '9928374655102938',
    status: 'Disabled',
    spendLimit: 30000,
    currentBalance: 320.00,
    licenseName: 'Legacy_Corp',
    createdAt: '2026-03-20',
    loginEmail: 'legacy09@adbez.com',
    proxyIp: '198.51.100.15:8080 (US-TX)'
  }
];

const INITIAL_FLOWS: WalletFlowItem[] = [
  { id: 'fl_1', type: 'Credit', description: 'Wallet deposit approved', category: 'Deposit', amount: 103.90, balanceBefore: 0, balanceAfter: 103.90, date: '5/7/2026 10:47 PM' },
  { id: 'fl_2', type: 'Debit', description: 'Deposit $100 + Fee $3 (3%) to META account 1167979775398325', category: 'Account Deposit', amount: 103.00, balanceBefore: 103.90, balanceAfter: 0.90, date: '4/30/2026 02:17 PM' },
  { id: 'fl_3', type: 'Credit', description: 'Deposit approved via AdBez Coins', category: 'Deposit', amount: 500.00, balanceBefore: 0.90, balanceAfter: 500.90, date: '5/12/2026 11:30 AM' },
  { id: 'fl_4', type: 'Debit', description: 'Deposit $200 + Fee $6 (3%) to GOOGLE account 849-291-0984', category: 'Account Deposit', amount: 206.00, balanceBefore: 500.90, balanceAfter: 294.90, date: '5/15/2026 04:12 PM' },
];

const INITIAL_DEPOSITS: DepositRecord[] = [
  { id: 'DEP202605075834292', platform: 'META', accountId: '1167979775398325', accountName: 'ArshadXGrowwzone Agency', depositAmount: 100, feePercent: 3, feeAmount: 3.00, totalCharged: 103.00, requestTime: 'May 7, 2026, 10:50 PM', status: 'Approved' },
  { id: 'DEP202604307322270', platform: 'META', accountId: '1167979775398325', accountName: 'ArshadXGrowwzone Agency', depositAmount: 100, feePercent: 3, feeAmount: 3.00, totalCharged: 103.00, requestTime: 'Apr 30, 2026, 02:17 PM', status: 'Approved' },
  { id: 'DEP202604221751653', platform: 'META', accountId: '2380795785666325', accountName: 'Growwzone X Arshad 01', depositAmount: 100, feePercent: 3, feeAmount: 3.00, totalCharged: 103.00, requestTime: 'Apr 22, 2026, 02:19 PM', status: 'Approved' },
];

const INITIAL_BMS: BMShareRecord[] = [
  { id: 'BM202604296766209', platform: 'META', adAccountName: 'ArshadXGrowwzone Agency', adAccountId: '1167979775398325', bmId: '798152282787766', requestTime: 'Apr 29, 2026, 08:08 PM', status: 'Approved' },
  { id: 'BM202604219498564', platform: 'META', adAccountName: 'Growwzone X Arshad 01', adAccountId: '2380795785666325', bmId: '798152282787766', requestTime: 'Apr 21, 2026, 11:21 PM', status: 'Approved' },
];

const INITIAL_APPLICATIONS: AccountApplication[] = [
  { id: 'APP2026041828911', platform: 'META', budgetAllocation: 5000, timezone: 'GMT-5 (New York)', licenseName: 'Arshad_Corp_US', status: 'Approved', appliedDate: 'Apr 18, 2026' },
  { id: 'APP2026050218842', platform: 'GOOGLE', budgetAllocation: 10000, timezone: 'GMT+0 (London)', licenseName: 'AdBez_UK_Agency', status: 'Approved', appliedDate: 'May 2, 2026' },
];

export const useAgencyStore = create<AgencyStore>()(
  persist(
    (set, get) => ({
      accounts: INITIAL_ACCOUNTS,
      applications: INITIAL_APPLICATIONS,
      bmShares: INITIAL_BMS,
      deposits: INITIAL_DEPOSITS,
      transfers: [],
      refunds: [],
      walletFlows: INITIAL_FLOWS,
      defaultFeePercent: 3.0,

      setDefaultFeePercent: (percent) => set({ defaultFeePercent: percent }),

      applyForAccount: async (platform, budget, timezone, license) => {
        const authUser = useAuthStore.getState().user;
        const currentBalance = authUser?.walletBalance ?? 294.90;
        const applyFee = 50.00; // Standard refundable initial application setup credit

        if (currentBalance < applyFee) {
          return false;
        }

        const newAfter = currentBalance - applyFee;
        if (useAuthStore.getState().user) {
          useAuthStore.getState().updateWallet(newAfter);
        }

        const newApp: AccountApplication = {
          id: 'APP' + Date.now().toString().slice(-10),
          platform: platform.toUpperCase(),
          budgetAllocation: budget,
          timezone,
          licenseName: license,
          status: 'Pending',
          appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const flow: WalletFlowItem = {
          id: 'fl_' + Date.now(),
          type: 'Debit',
          description: `Ad account application — ${platform.toUpperCase()} (${license})`,
          category: 'Ad Account Apply',
          amount: applyFee,
          balanceBefore: currentBalance,
          balanceAfter: newAfter,
          date: new Date().toLocaleString()
        };

        set((state) => ({
          applications: [newApp, ...state.applications],
          walletFlows: [flow, ...state.walletFlows],
        }));

        return true;
      },

      submitBMShare: (platform, accountId, bmId) => {
        const account = get().accounts.find(a => a.accountId === accountId || a.id === accountId);
        const newRecord: BMShareRecord = {
          id: 'BM' + Date.now().toString().slice(-10),
          platform: platform.toUpperCase(),
          adAccountName: account ? account.accountName : 'Custom Ad Account',
          adAccountId: account ? account.accountId : accountId,
          bmId,
          requestTime: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: 'Pending'
        };

        set((state) => ({
          bmShares: [newRecord, ...state.bmShares]
        }));
      },

      rechargeAccount: (accountId, amount) => {
        const state = get();
        const account = state.accounts.find(a => a.id === accountId || a.accountId === accountId);
        if (!account) return { success: false, message: 'Account not found in inventory.' };
        if (amount < 10) return { success: false, message: 'Minimum deposit amount is $10.' };

        const feePercent = state.defaultFeePercent;
        const feeAmount = (amount * feePercent) / 100;
        const totalCharged = amount + feeAmount;

        const authUser = useAuthStore.getState().user;
        const balanceBefore = authUser?.walletBalance ?? 294.90;
        if (balanceBefore < totalCharged) {
          return { success: false, message: `Insufficient wallet balance ($${balanceBefore.toFixed(2)}). Need $${totalCharged.toFixed(2)} including ${feePercent}% markup fee.` };
        }

        const balanceAfter = balanceBefore - totalCharged;
        if (useAuthStore.getState().user) {
          useAuthStore.getState().updateWallet(balanceAfter);
        }

        const depRecord: DepositRecord = {
          id: 'DEP' + Date.now().toString().slice(-10),
          platform: account.platform,
          accountId: account.accountId,
          accountName: account.accountName,
          depositAmount: amount,
          feePercent,
          feeAmount,
          totalCharged,
          requestTime: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: 'Approved' // Auto-approve instantly in simulation mode!
        };

        const flow: WalletFlowItem = {
          id: 'fl_' + Date.now(),
          type: 'Debit',
          description: `Deposit $${amount} + Fee $${feeAmount.toFixed(2)} (${feePercent}%) to ${account.platform} account ${account.accountId}`,
          category: 'Account Deposit',
          amount: totalCharged,
          balanceBefore,
          balanceAfter,
          date: new Date().toLocaleString()
        };

        const updatedAccounts = state.accounts.map(a => 
          (a.id === account.id) ? { ...a, currentBalance: a.currentBalance + amount } : a
        );

        set({
          accounts: updatedAccounts,
          deposits: [depRecord, ...state.deposits],
          walletFlows: [flow, ...state.walletFlows]
        });

        return { success: true, message: `Successfully recharged $${amount} into ${account.accountName}! ($${feeAmount.toFixed(2)} processing fee)` };
      },

      transferBalance: (fromId, toId, amount) => {
        const state = get();
        const fromAcc = state.accounts.find(a => a.id === fromId || a.accountId === fromId);
        const toAcc = state.accounts.find(a => a.id === toId || a.accountId === toId);

        if (!fromAcc || !toAcc) return { success: false, message: 'Invalid source or destination ad account.' };
        if (fromAcc.id === toAcc.id) return { success: false, message: 'Cannot transfer to the same account.' };
        if (fromAcc.currentBalance < amount) return { success: false, message: `Insufficient balance in ${fromAcc.accountName}. Available: $${fromAcc.currentBalance}` };

        const updatedAccounts = state.accounts.map(a => {
          if (a.id === fromAcc.id) return { ...a, currentBalance: a.currentBalance - amount };
          if (a.id === toAcc.id) return { ...a, currentBalance: a.currentBalance + amount };
          return a;
        });

        const record: TransferRecord = {
          id: 'TRF' + Date.now().toString().slice(-10),
          platform: fromAcc.platform,
          fromAccountId: fromAcc.accountId,
          fromAccountName: fromAcc.accountName,
          toAccountId: toAcc.accountId,
          toAccountName: toAcc.accountName,
          transferAmount: amount,
          requestTime: new Date().toLocaleString(),
          status: 'Approved'
        };

        set({
          accounts: updatedAccounts,
          transfers: [record, ...state.transfers]
        });

        return { success: true, message: `Transferred $${amount} from ${fromAcc.accountName} to ${toAcc.accountName}.` };
      },

      requestRefund: (accountId, amount) => {
        const state = get();
        const account = state.accounts.find(a => a.id === accountId || a.accountId === accountId);
        if (!account) return { success: false, message: 'Account not found.' };
        if (amount <= 0 || account.currentBalance < amount) {
          return { success: false, message: `Invalid amount. Maximum refund available is $${account.currentBalance}.` };
        }

        const authUser = useAuthStore.getState().user;
        const balanceBefore = authUser?.walletBalance ?? 294.90;
        const balanceAfter = balanceBefore + amount;

        if (useAuthStore.getState().user) {
          useAuthStore.getState().updateWallet(balanceAfter);
        }

        const updatedAccounts = state.accounts.map(a => 
          (a.id === account.id) ? { ...a, currentBalance: a.currentBalance - amount } : a
        );

        const refund: RefundRecord = {
          id: 'RFND' + Date.now().toString().slice(-10),
          platform: account.platform,
          accountId: account.accountId,
          accountName: account.accountName,
          refundAmount: amount,
          requestTime: new Date().toLocaleString(),
          status: 'Approved'
        };

        const flow: WalletFlowItem = {
          id: 'fl_' + Date.now(),
          type: 'Credit',
          description: `Ad Account Refund from ${account.platform} (${account.accountId})`,
          category: 'Refund',
          amount: amount,
          balanceBefore,
          balanceAfter,
          date: new Date().toLocaleString()
        };

        set({
          accounts: updatedAccounts,
          refunds: [refund, ...state.refunds],
          walletFlows: [flow, ...state.walletFlows]
        });

        return { success: true, message: `Refunded $${amount} directly into your AdBez Wallet Balance!` };
      },

      addWalletDeposit: (amount, remarks = 'Direct AdBez Coin Top-up', method = 'AdBez Coins / Direct Support') => {
        const authUser = useAuthStore.getState().user;
        const balanceBefore = authUser?.walletBalance ?? 294.90;
        const balanceAfter = balanceBefore + amount;

        if (useAuthStore.getState().user) {
          useAuthStore.getState().updateWallet(balanceAfter);
        }

        const flow: WalletFlowItem = {
          id: 'fl_' + Date.now(),
          type: 'Credit',
          description: `Deposit approved via ${method}`,
          category: 'Deposit',
          amount,
          balanceBefore,
          balanceAfter,
          date: new Date().toLocaleString()
        };

        set(state => ({
          walletFlows: [flow, ...state.walletFlows]
        }));
      }
    }),
    {
      name: 'adbez-agency-store-v1',
      partialize: (state) => ({
        accounts: state.accounts,
        applications: state.applications,
        bmShares: state.bmShares,
        deposits: state.deposits,
        transfers: state.transfers,
        refunds: state.refunds,
        walletFlows: state.walletFlows,
        defaultFeePercent: state.defaultFeePercent,
      }),
    }
  )
);
