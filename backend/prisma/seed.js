/**
 * AdBez Systems — Database Seed Script
 * Populates the database with initial admin user and sample ad account inventory.
 * Run: npm run db:seed
 */

require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { encryptJSON, encrypt } = require('../src/utils/encryption');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AdBez Systems database...\n');

  // ─── ADMIN USER ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@adbez.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure@2025!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: { email: adminEmail, passwordHash, role: 'ADMIN', walletBalance: 0 },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // Sample credentials to encrypt (simulated)
  const sampleCreds = (platform, id) => ({
    account_id: `${platform}_${id}_${Date.now()}`,
    email: `account${id}@${platform.toLowerCase()}.proxy`,
    password: `Secure#Pass${id}2025`,
    two_fa_backup: `XXXX-XXXX-XXXX-${id}`,
    notes: `${platform} account ready for deployment`,
  });

  const sampleProxy = 'socks5://user:pass@proxy.example.com:1080';

  // ─── AD ACCOUNTS ────────────────────────────────────────────────────────────
  const accounts = [
    // META — Ad Accounts
    { platform: 'META', category: 'ad-accounts', profileName: 'US Ad Account', country: 'US', countryFlag: '🇺🇸', spendingLimit: 50000, ageMonths: 24, price: 25, features: ['Agency Tier', 'Proxy Routed'], description: 'Trusted US routing infrastructure. Configured explicitly for rapid e-commerce scaling limits.', isFeatured: false },
    { platform: 'META', category: 'ad-accounts', profileName: 'VND Ad Account', country: 'VN', countryFlag: '🇻🇳', spendingLimit: 30000, ageMonths: 18, price: 20, features: ['High Compliance', 'Review Bypass'], description: 'High compliance threshold history metrics. Unlocks seamless clearance vectors on ad reviews.', isFeatured: false },
    { platform: 'META', category: 'ad-accounts', profileName: 'Hong Kong Ad Account (Credit Line)', country: 'HK', countryFlag: '🇭🇰', spendingLimit: 250000, ageMonths: 36, price: 85, features: ['Credit Line', 'Institutional', 'Corporate Tier'], description: 'Institutional billing bypass capabilities configured directly inside high expenditure channels.', isFeatured: true },
    // GOOGLE
    { platform: 'GOOGLE', category: 'ad-accounts', profileName: 'Google Ad Account', country: 'US', countryFlag: '🇺🇸', spendingLimit: 100000, ageMonths: 30, price: 45, features: ['Verified Console', 'Aged Network'], description: 'Aged network configurations setup. Automatically balances security filters to run scale operations.', isFeatured: false },
    // TIKTOK
    { platform: 'TIKTOK', category: 'ad-accounts', profileName: 'TikTok Ad Account', country: 'US', countryFlag: '🇺🇸', spendingLimit: 75000, ageMonths: 12, price: 40, features: ['Global Geo', 'Unrestricted'], description: 'Global geolocation targeting matrix metrics cleanly operationalized. Unrestricted deployment pipeline.', isFeatured: false },
    // FB PROFILES
    { platform: 'META', category: 'profiles', profileName: 'EU FB Profile', country: 'EU', countryFlag: '🇪🇺', spendingLimit: null, ageMonths: 24, price: 15, features: ['EU Geo', 'Pre-Cookied'], description: 'European geo routing architecture.', isFeatured: false },
    { platform: 'META', category: 'profiles', profileName: 'Standard Profile', country: 'US', countryFlag: '🇺🇸', spendingLimit: null, ageMonths: 18, price: 15, features: ['Warm Cookies', 'Trust Score'], description: 'Warm pre-cookied security files.', isFeatured: false },
    { platform: 'META', category: 'profiles', profileName: 'Hard To Die FB Profile', country: 'US', countryFlag: '🇺🇸', spendingLimit: null, ageMonths: 36, price: 25, features: ['Identity Re-instated', 'Compliance Check Proof'], description: 'Identity re-instated compliance check proof.', isFeatured: true },
    { platform: 'META', category: 'profiles', profileName: 'India Verified Profile', country: 'IN', countryFlag: '🇮🇳', spendingLimit: null, ageMonths: 24, price: 30, features: ['Document Verified', 'KYC Cleared'], description: 'Complete document verification cleared.', isFeatured: false },
    // BUSINESS MANAGERS (STANDARD)
    { platform: 'META', category: 'bm-standard', profileName: 'BM1 Asset', country: null, countryFlag: null, spendingLimit: null, ageMonths: 12, price: 10, features: ['Stack 1', 'Standard'], description: 'Single managed dashboard slot.', isFeatured: false },
    { platform: 'META', category: 'bm-standard', profileName: 'BM3 Asset', country: null, countryFlag: null, spendingLimit: null, ageMonths: 18, price: 25, features: ['Stack 3', 'Triple'], description: 'Triple managed dashboard slots.', isFeatured: false },
    { platform: 'META', category: 'bm-standard', profileName: 'BM WhatsApp Business API', country: null, countryFlag: null, spendingLimit: null, ageMonths: 12, price: 40, features: ['WhatsApp API', 'Official Node'], description: 'Official WhatsApp Business API gateway node.', isFeatured: false },
    // VERIFIED BMs
    { platform: 'META', category: 'bm-verified', profileName: 'Verified BM1', country: null, countryFlag: null, spendingLimit: null, ageMonths: 24, price: 30, features: ['Document Registry', 'Authenticated', 'Verified'], description: 'Document registry authenticated.', isFeatured: false },
    { platform: 'META', category: 'bm-verified', profileName: 'Verified BM3', country: null, countryFlag: null, spendingLimit: null, ageMonths: 30, price: 50, features: ['Triple Managed', 'Verified', 'Corporate'], description: 'Triple managed dashboard slots.', isFeatured: false },
    { platform: 'META', category: 'bm-verified', profileName: 'Verified BM5', country: null, countryFlag: null, spendingLimit: null, ageMonths: 36, price: 200, features: ['5-Node', 'Enterprise', 'Verified'], description: '5 high trust node deployments.', isFeatured: true },
    { platform: 'META', category: 'bm-verified', profileName: 'Verified BM10', country: null, countryFlag: null, spendingLimit: null, ageMonths: 48, price: 380, features: ['10-Node', 'Institutional', 'Master Core'], description: 'Ultimate institutional master core.', isFeatured: true },
    { platform: 'META', category: 'bm-verified', profileName: 'BM Share (5 Ad Accounts) — $250 Daily Caps', country: null, countryFlag: null, spendingLimit: 250, ageMonths: 24, price: 250, features: ['5 Ad Accounts', '$250 Daily Cap', 'Pre-Routed'], description: 'Pre-routed institutional allocation nodes ready for asset synchronization.', isFeatured: false },
    { platform: 'META', category: 'bm-verified', profileName: 'BM Share (5 Ad Accounts) — Uncapped', country: null, countryFlag: null, spendingLimit: 999999, ageMonths: 36, price: 450, features: ['5 Ad Accounts', 'Uncapped', 'No Daily Limits', 'Maximum Scale'], description: 'Maximum scale velocity framework. Absolute raw deployment capabilities.', isFeatured: true },
    // PAGES
    { platform: 'META', category: 'pages', profileName: 'Crypto Niche Page', country: null, countryFlag: null, spendingLimit: null, ageMonths: 24, price: 13, features: ['Crypto', 'Web3', 'High Compliance'], description: 'Web3 high compliance velocity asset.', isFeatured: false },
    { platform: 'META', category: 'pages', profileName: 'Gambling Niche Page', country: null, countryFlag: null, spendingLimit: null, ageMonths: 18, price: 13, features: ['iGaming', 'Policy Shield', 'Gambling'], description: 'iGaming policy shield configured structure.', isFeatured: false },
  ];

  let created = 0;
  for (const [i, acc] of accounts.entries()) {
    await prisma.adAccount.create({
      data: {
        ...acc,
        status: 'AVAILABLE',
        credentialsJson: encryptJSON(sampleCreds(acc.platform, i + 1)),
        proxyDetails: encrypt(sampleProxy),
      },
    });
    created++;
  }

  console.log(`✅ Created ${created} ad accounts`);
  console.log('\n🎉 Database seeding complete!\n');
  console.log(`   Admin Login: ${adminEmail}`);
  console.log(`   Admin Pass:  ${adminPassword}`);
  console.log(`   API Docs:    http://localhost:3001/health\n`);
}

main()
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
