import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ToastContainer } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Preloader } from '@/components/ui/Preloader';

export const metadata: Metadata = {
  title: 'AdBez — Institutional Ad Account Marketplace',
  description: 'Premium marketplace for institutional media buyers. Verified Google Ads, Facebook Agency Accounts, TikTok Ads and more.',
  keywords: ['ad accounts', 'media buying', 'agency accounts', 'facebook ads', 'google ads', 'tiktok ads'],
  openGraph: {
    title: 'AdBez — Institutional Ad Account Marketplace',
    description: 'Premium verified ad accounts for institutional media buyers.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Preloader />
          <Navbar />
          <main className="flex-1 relative z-[1]">
            {children}
          </main>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
