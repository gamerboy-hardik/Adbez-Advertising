import type {
  ApiResponse, AdAccount, Transaction, CheckoutResult,
  DashboardStats, FootprintLog, User
} from '@/types';
import { PLACEHOLDER_ACCOUNTS } from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── OFFLINE MOCK STATE ───────────────────────────────────────────────────────
let _mockAccounts = [...PLACEHOLDER_ACCOUNTS];


// ─── TOKEN MANAGEMENT ─────────────────────────────────────────────────────────

function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  try {
    const stored = JSON.parse(localStorage.getItem('adbez-auth') || '{}');
    return {
      accessToken:  stored?.state?.accessToken  || null,
      refreshToken: stored?.state?.refreshToken || null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data.success) return null;

  // Update the stored token in Zustand persist storage
  const stored = JSON.parse(localStorage.getItem('adbez-auth') || '{}');
  if (stored.state) {
    stored.state.accessToken = data.data.accessToken;
    localStorage.setItem('adbez-auth', JSON.stringify(stored));
  }

  return data.data.accessToken;
}

// ─── CORE FETCH WRAPPER ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const { accessToken } = getStoredTokens();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const json: ApiResponse<T> = await res.json();

    // Auto-refresh on 401 TOKEN_EXPIRED
    if (res.status === 401 && json.error === 'TOKEN_EXPIRED' && retry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiFetch<T>(path, options, false);
      }
    }

    return json;
  } catch (err) {
    console.error(`[API Fetch Error] ${path}:`, err);
    return { success: false, error: 'Network Error', message: 'Could not connect to server' } as any;
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string) =>
    apiFetch<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken: string) =>
    apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  me: () => apiFetch<{ user: User }>('/auth/me'),
};

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────

export const accountsApi = {
  list: async (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    const res = await apiFetch<{ accounts: AdAccount[]; pagination: unknown }>(`/accounts${qs}`);
    if (!res.success) {
      return { success: true, data: { accounts: _mockAccounts, pagination: { total: _mockAccounts.length } } } as any;
    }
    return res;
  },

  get: (id: string) =>
    apiFetch<{ account: AdAccount }>(`/accounts/${id}`),

  getCategoryStats: async () => {
    const res = await apiFetch<{ stats: Record<string, number> }>('/accounts/stats');
    if (!res.success) {
      // Mock category stats based on _mockAccounts
      const stats = _mockAccounts.reduce((acc: any, acct) => {
        acc[acct.category] = (acc[acct.category] || 0) + 1;
        return acc;
      }, {});
      return { success: true, data: { stats } } as any;
    }
    return res;
  },
};

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

export const transactionsApi = {
  checkout: (accountIds: string[]) =>
    apiFetch<CheckoutResult>('/transactions/checkout', {
      method: 'POST',
      body: JSON.stringify({ accountIds }),
    }),

  topup: (amount: number) =>
    apiFetch<{ amount: number; bonus: number; totalCredit: number; invoiceId: string }>('/transactions/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiFetch<{ transactions: Transaction[]; pagination: unknown }>(`/transactions${qs}`);
  },

  get: (id: string) =>
    apiFetch<{ id: string; totalAmount: number; paymentStatus: string; assets: unknown[] }>(`/transactions/${id}`),
};

// ─── FOOTPRINT ────────────────────────────────────────────────────────────────

export const footprintApi = {
  log: (payload: {
    sessionId: string;
    canvasHash?: string;
    screenRes?: string;
    browserLang?: string;
    timezone?: string;
    osDetails?: string;
    actionPerformed: string;
    pathTraversed?: string;
    ipData?: { ip?: string; isp?: string; country?: string; city?: string };
  }) =>
    apiFetch('/footprint', { method: 'POST', body: JSON.stringify(payload) }),
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: () =>
    apiFetch<{ stats: DashboardStats; recentTransactions: Transaction[] }>('/admin/stats'),

  // Accounts
  listAccounts: async (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    const res = await apiFetch<{ accounts: AdAccount[]; pagination: unknown }>(`/admin/accounts${qs}`);
    // If backend fails (e.g. Postgres offline), use mock data
    if (!res.success) {
      return { success: true, data: { accounts: _mockAccounts, pagination: { total: _mockAccounts.length } } } as any;
    }
    return res;
  },
  createAccount: async (data: Partial<AdAccount> & { credentials?: unknown; proxyDetails?: string }) => {
    const res = await apiFetch('/admin/accounts', { method: 'POST', body: JSON.stringify(data) });
    if (!res.success) {
      // Mock creation
      const newAcc = { id: 'mock_' + Date.now(), ...data, createdAt: new Date().toISOString() } as AdAccount;
      _mockAccounts = [newAcc, ..._mockAccounts];
      return { success: true, data: { account: newAcc } } as any;
    }
    return res;
  },
  updateAccount: async (id: string, data: Partial<AdAccount>) => {
    const res = await apiFetch(`/admin/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!res.success) {
      // Mock update
      _mockAccounts = _mockAccounts.map(a => a.id === id ? { ...a, ...data } : a) as AdAccount[];
      return { success: true, data: { account: _mockAccounts.find(a => a.id === id) } } as any;
    }
    return res;
  },
  deleteAccount: (id: string) =>
    apiFetch(`/admin/accounts/${id}`, { method: 'DELETE' }),
  importAccounts: (accounts: unknown[]) =>
    apiFetch('/admin/accounts/import', { method: 'POST', body: JSON.stringify({ accounts }) }),

  // Transactions
  listTransactions: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiFetch<{ transactions: Transaction[]; pagination: unknown }>(`/admin/transactions${qs}`);
  },
  updateTransactionStatus: (id: string, status: string) =>
    apiFetch(`/admin/transactions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Footprint
  getFootprint: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiFetch<{ logs: FootprintLog[]; pagination: unknown }>(`/admin/footprint${qs}`);
  },

  // Users
  listUsers: async () => {
    const res = await apiFetch<{ users: User[] }>('/admin/users');
    if (!res.success) {
      // Mock data if backend fails
      return {
        success: true,
        data: {
          users: [
            { id: 'usr_1', email: 'admin@adbez.com', role: 'ADMIN', walletBalance: 1500, createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastLogin: new Date().toISOString(), provider: 'Google', ipAddress: '192.168.1.104' },
            { id: 'usr_2', email: 'john@agency.com', role: 'CLIENT', walletBalance: 250, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(), provider: 'Email', ipAddress: '104.28.19.12' },
            { id: 'usr_3', email: 'sarah@tiktokads.net', role: 'CLIENT', walletBalance: 0, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), lastLogin: new Date(Date.now() - 86400000).toISOString(), provider: 'Google', ipAddress: '45.33.22.199' },
          ]
        }
      } as any;
    }
    return res;
  },
  updateUserRole: (id: string, role: string) =>
    apiFetch(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  updateUserWallet: (id: string, amount: number) =>
    apiFetch(`/admin/users/${id}/wallet`, { method: 'PUT', body: JSON.stringify({ amount }) }),
};
