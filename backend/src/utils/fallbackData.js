/**
 * AdBez Systems — Fallback In-Memory Catalog & Admin Data
 * Used whenever PostgreSQL / Supabase pooler is unreachable or paused.
 */

const FALLBACK_ACCOUNTS = [
  { id: 'acc_1', platform: 'META', category: 'ad-accounts', profileName: 'US Ad Account', country: 'US', countryFlag: '🇺🇸', spendingLimit: 50000, ageMonths: 24, price: 25, features: ['Agency Tier', 'Proxy Routed'], description: 'Trusted US routing infrastructure. Configured explicitly for rapid e-commerce scaling limits.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: 'acc_2', platform: 'META', category: 'ad-accounts', profileName: 'VND Ad Account', country: 'VN', countryFlag: '🇻🇳', spendingLimit: 30000, ageMonths: 18, price: 20, features: ['High Compliance', 'Review Bypass'], description: 'High compliance threshold history metrics. Unlocks seamless clearance vectors on ad reviews.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 18).toISOString() },
  { id: 'acc_3', platform: 'META', category: 'ad-accounts', profileName: 'Hong Kong Ad Account (Credit Line)', country: 'HK', countryFlag: '🇭🇰', spendingLimit: 250000, ageMonths: 36, price: 85, features: ['Credit Line', 'Institutional', 'Corporate Tier'], description: 'Institutional billing bypass capabilities configured directly inside high expenditure channels.', isFeatured: true, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'acc_4', platform: 'GOOGLE', category: 'ad-accounts', profileName: 'Google Ad Account', country: 'US', countryFlag: '🇺🇸', spendingLimit: 100000, ageMonths: 30, price: 45, features: ['Verified Console', 'Aged Network'], description: 'Aged network configurations setup. Automatically balances security filters to run scale operations.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: 'acc_5', platform: 'TIKTOK', category: 'ad-accounts', profileName: 'TikTok Ad Account', country: 'US', countryFlag: '🇺🇸', spendingLimit: 75000, ageMonths: 12, price: 40, features: ['Global Geo', 'Unrestricted'], description: 'Global geolocation targeting matrix metrics cleanly operationalized. Unrestricted deployment pipeline.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'acc_6', platform: 'META', category: 'profiles', profileName: 'EU FB Profile', country: 'EU', countryFlag: '🇪🇺', spendingLimit: null, ageMonths: 24, price: 15, features: ['EU Geo', 'Pre-Cookied'], description: 'European geo routing architecture.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 9).toISOString() },
  { id: 'acc_7', platform: 'META', category: 'profiles', profileName: 'Standard Profile', country: 'US', countryFlag: '🇺🇸', spendingLimit: null, ageMonths: 18, price: 15, features: ['Warm Cookies', 'Trust Score'], description: 'Warm pre-cookied security files.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
  { id: 'acc_8', platform: 'META', category: 'profiles', profileName: 'Hard To Die FB Profile', country: 'US', countryFlag: '🇺🇸', spendingLimit: null, ageMonths: 36, price: 25, features: ['Identity Re-instated', 'Compliance Check Proof'], description: 'Identity re-instated compliance check proof.', isFeatured: true, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 'acc_9', platform: 'META', category: 'profiles', profileName: 'India Verified Profile', country: 'IN', countryFlag: '🇮🇳', spendingLimit: null, ageMonths: 24, price: 30, features: ['Document Verified', 'KYC Cleared'], description: 'Complete document verification cleared.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: 'acc_10', platform: 'META', category: 'bm-standard', profileName: 'BM1 Asset', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 12, price: 10, features: ['Stack 1', 'Standard'], description: 'Single managed dashboard slot.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'acc_11', platform: 'META', category: 'bm-standard', profileName: 'BM3 Asset', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 18, price: 25, features: ['Stack 3', 'Triple'], description: 'Triple managed dashboard slots.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'acc_12', platform: 'META', category: 'bm-standard', profileName: 'BM WhatsApp Business API', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 12, price: 40, features: ['WhatsApp API', 'Official Node'], description: 'Official WhatsApp Business API gateway node.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'acc_13', platform: 'META', category: 'bm-verified', profileName: 'Verified BM1', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 24, price: 30, features: ['Document Registry', 'Authenticated', 'Verified'], description: 'Document registry authenticated.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'acc_14', platform: 'META', category: 'bm-verified', profileName: 'Verified BM3', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 30, price: 50, features: ['Triple Managed', 'Verified', 'Corporate'], description: 'Triple managed dashboard slots.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'acc_15', platform: 'META', category: 'bm-verified', profileName: 'Verified BM5', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 36, price: 200, features: ['5-Node', 'Enterprise', 'Verified'], description: '5 high trust node deployments.', isFeatured: true, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'acc_16', platform: 'META', category: 'bm-verified', profileName: 'Verified BM10', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 48, price: 380, features: ['10-Node', 'Institutional', 'Master Core'], description: 'Ultimate institutional master core.', isFeatured: true, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'acc_17', platform: 'META', category: 'bm-verified', profileName: 'BM Share (5 Ad Accounts) — $250 Daily Caps', country: null, countryFlag: '🌐', spendingLimit: 250, ageMonths: 24, price: 250, features: ['5 Ad Accounts', '$250 Daily Cap', 'Pre-Routed'], description: 'Pre-routed institutional allocation nodes ready for asset synchronization.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'acc_18', platform: 'META', category: 'bm-verified', profileName: 'BM Share (5 Ad Accounts) — Uncapped', country: null, countryFlag: '🌐', spendingLimit: 999999, ageMonths: 36, price: 450, features: ['5 Ad Accounts', 'Uncapped', 'No Daily Limits', 'Maximum Scale'], description: 'Maximum scale velocity framework. Absolute raw deployment capabilities.', isFeatured: true, status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'acc_19', platform: 'META', category: 'pages', profileName: 'Crypto Niche Page', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 24, price: 13, features: ['Crypto', 'Web3', 'High Compliance'], description: 'Web3 high compliance velocity asset.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'acc_20', platform: 'META', category: 'pages', profileName: 'Gambling Niche Page', country: null, countryFlag: '🌐', spendingLimit: null, ageMonths: 18, price: 13, features: ['iGaming', 'Policy Shield', 'Gambling'], description: 'iGaming policy shield configured structure.', isFeatured: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },
];

const FALLBACK_USERS = [
  { id: 'usr_admin', email: 'admin@adbez.com', role: 'ADMIN', walletBalance: 25000, provider: 'Email', lastLogin: new Date().toISOString(), ipAddress: '104.28.19.12', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
  { id: 'usr_trushal', email: 'trushalpalpvt@gmail.com', role: 'ADMIN', walletBalance: 50000, provider: 'Google', lastLogin: new Date().toISOString(), ipAddress: '192.168.1.104', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'usr_2', email: 'media@scaleagency.io', role: 'CLIENT', walletBalance: 3450, provider: 'Email', lastLogin: new Date(Date.now() - 3600000 * 3).toISOString(), ipAddress: '172.56.21.89', createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
  { id: 'usr_3', email: 'growth@ecommercegroup.com', role: 'CLIENT', walletBalance: 820, provider: 'Google', lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), ipAddress: '68.195.42.10', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

const FALLBACK_REQUESTS = [
  { id: 'req_1', userId: 'usr_2', type: 'WALLET_TOPUP', amount: 1500, status: 'PENDING', notes: 'USDT TRC20 transfer confirmation hash attached', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), user: { email: 'media@scaleagency.io', walletBalance: 3450 } },
  { id: 'req_2', userId: 'usr_3', type: 'ACCOUNT_APPLICATION', amount: null, status: 'PENDING', notes: 'Need 3x Verified BM5 with $250k credit lines for BFCM launch', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), user: { email: 'growth@ecommercegroup.com', walletBalance: 820 } },
];

const FALLBACK_TRANSACTIONS = [
  { id: 'tx_1', userId: 'usr_2', totalAmount: 499, paymentStatus: 'COMPLETED', paymentMethod: 'WALLET', type: 'MARKETPLACE_PURCHASE', createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), user: { email: 'media@scaleagency.io' } },
  { id: 'tx_2', userId: 'usr_3', totalAmount: 299, paymentStatus: 'COMPLETED', paymentMethod: 'WALLET', type: 'MARKETPLACE_PURCHASE', createdAt: new Date(Date.now() - 3600000 * 18).toISOString(), user: { email: 'growth@ecommercegroup.com' } },
  { id: 'tx_3', userId: 'usr_2', totalAmount: 149, paymentStatus: 'COMPLETED', paymentMethod: 'WALLET', type: 'MARKETPLACE_PURCHASE', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), user: { email: 'media@scaleagency.io' } },
];

function filterFallbackAccounts(query = {}) {
  const {
    category,
    platform,
    country,
    minPrice,
    maxPrice,
    minSpend,
    search,
    page = 1,
    limit = 50,
  } = query;

  let filtered = [...FALLBACK_ACCOUNTS];

  if (category && category !== 'all') {
    filtered = filtered.filter(a => a.category === category);
  }
  if (platform) {
    filtered = filtered.filter(a => a.platform.toUpperCase() === platform.toUpperCase());
  }
  if (country) {
    filtered = filtered.filter(a => a.country?.toUpperCase() === country.toUpperCase());
  }
  if (minPrice) {
    filtered = filtered.filter(a => a.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(a => a.price <= parseFloat(maxPrice));
  }
  if (minSpend) {
    filtered = filtered.filter(a => (a.spendingLimit || 0) >= parseFloat(minSpend));
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.profileName.toLowerCase().includes(s) ||
      (a.description && a.description.toLowerCase().includes(s)) ||
      a.platform.toLowerCase().includes(s) ||
      (a.country && a.country.toLowerCase().includes(s))
    );
  }

  const total = filtered.length;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = Math.min(parseInt(limit), 100);
  const paged = filtered.slice(skip, skip + take);

  return {
    accounts: paged,
    pagination: {
      total,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

function getFallbackCategoryStats() {
  const stats = {};
  for (const acc of FALLBACK_ACCOUNTS) {
    if (acc.status === 'AVAILABLE') {
      stats[acc.category] = (stats[acc.category] || 0) + 1;
    }
  }
  return stats;
}

module.exports = {
  FALLBACK_ACCOUNTS,
  FALLBACK_USERS,
  FALLBACK_REQUESTS,
  FALLBACK_TRANSACTIONS,
  filterFallbackAccounts,
  getFallbackCategoryStats,
};
