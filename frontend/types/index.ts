// ─── AD ACCOUNT ──────────────────────────────────────────────────────────────

export type AccountStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type Platform = 'META' | 'GOOGLE' | 'TIKTOK' | 'BING';
export type Category = 'ad-accounts' | 'profiles' | 'bm-standard' | 'bm-verified' | 'pages';

export interface AdAccount {
  id: string;
  platform: Platform | string;
  category: Category | string;
  profileName: string;
  country: string | null;
  countryFlag: string | null;
  spendingLimit: number | null;
  ageMonths: number | null;
  price: number;
  status: AccountStatus;
  features: string[];
  description: string | null;
  isFeatured: boolean;
  createdAt: string;
  // Admin-only presence flags (no actual values)
  hasCredentials?: boolean;
  hasProxy?: boolean;
  hasCookie?: boolean;
  hasRecovery?: boolean;
}

export interface AdAccountCredentials {
  id: string;
  profileName: string;
  platform: string;
  country: string | null;
  credentials: Record<string, unknown> | null;
  proxyDetails: string | null;
  cookieFile: string | null;
  recoveryFile: string | null;
}

// ─── USER ─────────────────────────────────────────────────────────────────────

export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  walletBalance: number;
  createdAt: string;
  lastLogin?: string;
  provider?: string;
  ipAddress?: string;
}

// ─── CART ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;         // AdAccount id
  name: string;       // profileName
  platform: string;
  countryFlag: string | null;
  price: number;
  quantity: number;
}

// ─── TRANSACTION ──────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FLAGGED' | 'REFUNDED';
export type PaymentMethod = 'WALLET' | 'NOWPAYMENTS';

export interface TransactionItem {
  id: string;
  price: number;
  adAccount: Pick<AdAccount, 'id' | 'profileName' | 'platform' | 'country' | 'countryFlag'>;
}

export interface Transaction {
  id: string;
  userId?: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paymentRef: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'email'>;
  items: TransactionItem[];
}

export interface CheckoutResult {
  transactionId: string;
  totalAmount: number;
  discount: string | null;
  purchasedAt: string;
  assets: AdAccountCredentials[];
}

// ─── FOOTPRINT ────────────────────────────────────────────────────────────────

export interface FootprintLog {
  id: string;
  userId: string | null;
  sessionId: string;
  ipAddress: string | null;
  ipv6Address: string | null;
  isp: string | null;
  country: string | null;
  city: string | null;
  vpnDetected: boolean;
  userAgent: string | null;
  screenRes: string | null;
  osDetails: string | null;
  browserLang: string | null;
  canvasHash: string | null;
  timezone: string | null;
  actionPerformed: string;
  pathTraversed: string | null;
  authState: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'email'> | null;
  anomaly?: boolean;
}

export type FootprintAction =
  | 'PAGE_VIEW'
  | 'VIEW_PRODUCT'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'OPEN_CART'
  | 'CHECKOUT_INITIATED'
  | 'CHECKOUT_COMPLETED'
  | 'LOGIN'
  | 'REGISTER'
  | 'LOGOUT'
  | 'TOPUP_INITIATED';

// ─── API RESPONSE ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  errors?: Array<{ msg: string; path: string }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalAccounts: number;
  availableAccounts: number;
  soldAccounts: number;
  totalTransactions: number;
  completedRevenue: number;
  totalUsers: number;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
