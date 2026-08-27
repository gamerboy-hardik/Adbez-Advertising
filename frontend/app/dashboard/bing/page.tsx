'use client';
import { PlatformHub } from '@/components/dashboard/PlatformHub';

export default function BingHubPage() {
  return (
    <PlatformHub 
      platform="BING" 
      title="Bing Ads VIP Whitelisted Portal" 
      subtitle="Microsoft Advertising & Search Partner Matrix"
      badgeColor="text-sky-400"
      glowColor="from-sky-500/20"
    />
  );
}
