'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Clock, FileText } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { formatCurrency } from '@/lib/utils';
import { Preloader } from '@/components/ui/Preloader';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToastStore();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'LOGS'>('PENDING');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await adminApi.listRequests({ limit: 100 });
    if (res.success && res.data) {
      setRequests(res.data.requests);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'DENIED') => {
    const res = await adminApi.actionRequest(id, status);
    if (res.success) {
      success(`Request ${status.toLowerCase()} successfully`);
      fetchRequests(); // refresh
    } else {
      error(`Failed to ${status.toLowerCase()} request`);
    }
  };

  if (loading) return <Preloader fullScreen text="Loading Requests..." />;

  const filteredRequests = requests.filter(r => 
    activeTab === 'PENDING' ? r.status === 'PENDING' : r.status !== 'PENDING'
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-primary" /> User Requests & Top-ups
        </h1>
        <div className="flex bg-card rounded-lg border border-border p-1">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'PENDING' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Pending Actions
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'LOGS' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Past Logs
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No requests found in this category.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Details</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{req.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{req.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold">
                      {req.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {req.type === 'WALLET_TOPUP' ? (
                      <div>
                        <p className="font-bold text-emerald-400">{formatCurrency(req.amount)}</p>
                        <p className="text-[10px] text-muted-foreground">TX: {req.metadata?.txHash}</p>
                      </div>
                    ) : (
                      <p className="text-xs">{JSON.stringify(req.metadata)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'APPROVED')}
                          className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded transition-colors"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'DENIED')}
                          className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                          title="Deny"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-bold ${req.status === 'APPROVED' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {req.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
