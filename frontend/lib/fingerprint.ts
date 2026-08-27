import { v4 as uuidv4 } from 'uuid';
import type { FootprintAction } from '@/types';
import { footprintApi } from '@/lib/api';

// ─── SESSION ID ───────────────────────────────────────────────────────────────
const SESSION_KEY = 'adbez_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ─── CANVAS FINGERPRINT ───────────────────────────────────────────────────────

export async function getCanvasHash(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('AdBez Systems Fingerprint 🛡️', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('AdBez Systems Fingerprint 🛡️', 4, 17);

    const dataURL = canvas.toDataURL();
    const msgBuffer = new TextEncoder().encode(dataURL);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

// ─── DEVICE INFO ──────────────────────────────────────────────────────────────

export function getDeviceInfo() {
  if (typeof window === 'undefined') return {};

  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screen_res = `${window.screen.width}x${window.screen.height}`;

  // Simplified OS detection
  let osDetails = 'Unknown';
  if (/Windows/.test(ua)) osDetails = 'Windows';
  else if (/Mac/.test(ua)) osDetails = 'macOS';
  else if (/Linux/.test(ua)) osDetails = 'Linux';
  else if (/Android/.test(ua)) osDetails = 'Android';
  else if (/iOS|iPhone|iPad/.test(ua)) osDetails = 'iOS';

  return {
    userAgent: ua,
    platform,
    browserLang: lang,
    timezone: tz,
    screenRes: screen_res,
    osDetails,
  };
}

// ─── IP DATA (best-effort, non-blocking) ──────────────────────────────────────

let cachedIpData: Record<string, string> | null = null;

export async function getIpData(): Promise<Record<string, string>> {
  if (cachedIpData) return cachedIpData;
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    cachedIpData = {
      ip:      data.ip      || '',
      country: data.country || '',
      city:    data.city    || '',
      isp:     data.org     || '',
    };
    return cachedIpData;
  } catch {
    return {};
  }
}

// ─── MAIN LOG FUNCTION ────────────────────────────────────────────────────────

let canvasHashCache: string | null = null;
let ipDataCache: Record<string, string> | null = null;

/**
 * Log a client interaction to the backend footprint endpoint.
 * Non-blocking — failures are silently swallowed.
 */
export async function logFootprint(action: FootprintAction, path?: string): Promise<void> {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;

    // Compute canvas hash once and cache it
    if (!canvasHashCache) {
      canvasHashCache = await getCanvasHash();
    }

    // Fetch IP data once and cache it
    if (!ipDataCache) {
      ipDataCache = await getIpData();
    }

    const device = getDeviceInfo();

    // Fire and forget
    footprintApi.log({
      sessionId,
      canvasHash:     canvasHashCache || undefined,
      screenRes:      device.screenRes,
      browserLang:    device.browserLang,
      timezone:       device.timezone,
      osDetails:      device.osDetails,
      actionPerformed: action,
      pathTraversed:  path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
      ipData:         ipDataCache,
    }).catch(() => {/* silent */});
  } catch {
    // Non-blocking — never throw from fingerprint code
  }
}
