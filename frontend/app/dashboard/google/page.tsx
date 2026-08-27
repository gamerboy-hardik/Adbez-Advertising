'use client';
import { PlatformHub } from '@/components/dashboard/PlatformHub';

export default function GoogleHubPage() {
  return (
    <PlatformHub 
      platform="GOOGLE" 
      title="Google Ads MCC Enterprise Matrix" 
      subtitle="Google Search, YouTube & Performance Max"
      badgeColor="text-amber-400"
      glowColor="from-amber-500/20"
    />
  );
}
