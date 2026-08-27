'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Wifi, Globe, Monitor } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { formatDate, truncateId } from '@/lib/utils';
import type { FootprintLog } from '@/types';

export default function FootprintPage() {
  const [logs, setLogs] = useState<FootprintLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [vpnOnly, setVpnOnly] = useState(false);

  useEffect(() => {
    adminApi.getFootprint(vpnOnly ? { vpnOnly: 'true' } : {}).then(res => {
      if (res.success && res.data) setLogs(res.data.logs);
      setLoading(false);
    });
  }, [vpnOnly]);

  const anomalies = logs.filter(l => l.anomaly || l.vpnDetected).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Footprint Monitor</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Hardware fingerprint tracking &amp; behavioral anomaly detection.
            {anomalies > 0 && (
              <span className="ml-2 text-rose-400 font-semibold">{anomalies} anomaly alert(s) detected</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={vpnOnly}
              onChange={e => setVpnOnly(e.target.checked)}
              className="w-3.5 h-3.5 accent-rose-500"
            />
            VPN/Anomaly Only
          </label>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Session', 'User', 'IP / Country', 'Device', 'Action', 'VPN', 'Canvas Hash', 'Time'].map(h => (
                  <th key={h} className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3 bg-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-2.5 bg-primary/[0.03] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
                : logs.map(log => (
                  <tr
                    key={log.id}
                    className={[
                      'border-b border-border transition-colors',
                      log.anomaly ? 'bg-rose-500/[0.04] hover:bg-rose-500/[0.06]' : 'hover:bg-primary/[0.015]',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 font-['Space_Grotesk'] text-[10px] font-bold text-primary">
                      {truncateId(log.sessionId, 8)}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground max-w-[120px] truncate">
                      {log.user?.email || <span className="text-muted-foreground">Guest</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Globe size={10} className="text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground font-mono">{log.ipAddress || '-'}</p>
                          <p className="text-[9px] text-muted-foreground">{log.country} {log.city ? `· ${log.city}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">{log.osDetails || '-'}</p>
                        <p className="text-[9px] text-muted-foreground">{log.screenRes || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground whitespace-nowrap">{log.actionPerformed}</td>
                    <td className="px-4 py-3">
                      {log.vpnDetected ? (
                        <Badge variant="vpn">
                          <Wifi size={8} /> VPN
                        </Badge>
                      ) : <span className="text-[10px] text-muted-foreground">Clean</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-muted-foreground max-w-[80px] truncate">
                          {log.canvasHash?.slice(0, 12) || '-'}
                        </span>
                        {log.anomaly && (
                          <AlertTriangle size={10} className="text-rose-400 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  </tr>
                ))
              }
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs text-muted-foreground">No footprint data collected yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
