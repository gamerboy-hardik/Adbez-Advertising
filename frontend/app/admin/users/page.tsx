'use client';
import { useEffect, useState } from 'react';
import { Shield, ShieldAlert, Key, Ban } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { useToastStore } from '@/store/toastStore';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { User } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { success, error } = useToastStore();

  useEffect(() => {
    adminApi.listUsers().then(res => {
      if (res.success && res.data) setUsers(res.data.users);
      setLoading(false);
    });
  }, []);

  const handleRoleUpdate = async (id: string, role: string) => {
    setUpdating(id);
    const res = await adminApi.updateUserRole(id, role as 'CLIENT' | 'ADMIN');
    if (res.success) {
      success(`User role updated to ${role}.`);
      setUsers(u => u.map(x => x.id === id ? { ...x, role: role as 'CLIENT' | 'ADMIN' } : x));
    } else {
      error(res.message || 'Failed to update role.');
    }
    setUpdating(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Space_Grotesk'] text-xl font-bold text-foreground">Identity Access Management</h1>
        <p className="text-xs text-muted-foreground mt-1">Control matrix for user node privileges and access.</p>
      </div>

      <div className="bg-card rounded-2xl overflow-hidden shadow-md relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50 dark:bg-muted/50 backdrop-blur-md">
                {['User Node', 'Role', 'Wallet', 'Created', 'Provider', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3 bg-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5"><div className="h-3 bg-muted/50 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
                : users.map(user => (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-muted transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/[0.04] border border-border flex items-center justify-center">
                          {user.role === 'ADMIN' ? (
                            <ShieldAlert size={14} className="text-primary" />
                          ) : (
                            <Key size={14} className="text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{user.email}</p>
                          <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[120px]">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={user.role === 'ADMIN' ? 'admin' : 'vpn'}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-display text-xs font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
                      {formatCurrency(user.walletBalance)}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold bg-card border border-border px-2 py-0.5 rounded-md text-muted-foreground">
                        {user.provider || 'Email'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.lastLogin ? (
                        <div className="flex flex-col">
                          <span className="text-[11px] text-foreground font-semibold">{formatDate(user.lastLogin)}</span>
                          {user.ipAddress && <span className="text-[9px] text-muted-foreground font-mono">{user.ipAddress}</span>}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={user.role}
                        onChange={e => handleRoleUpdate(user.id, e.target.value)}
                        disabled={updating === user.id}
                        className="bg-muted border border-border rounded-lg py-1.5 px-2 text-[10px] text-foreground focus:outline-none focus:border-cyan-500/30 disabled:opacity-50 transition-all font-semibold"
                      >
                        <option value="CLIENT">Base User</option>
                        <option value="ADMIN">System Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
