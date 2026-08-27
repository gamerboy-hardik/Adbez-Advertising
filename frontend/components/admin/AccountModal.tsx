'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/store/toastStore';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCategory?: string;
  editData?: any;
}

export function AccountModal({ isOpen, onClose, onSuccess, defaultCategory = 'ad-accounts', editData }: AccountModalProps) {
  const { success, error } = useToastStore();
  const [form, setForm] = useState({
    platform: 'META', category: defaultCategory, profileName: '',
    country: '', countryFlag: '', spendingLimit: '', ageMonths: '', price: '',
    description: '', isFeatured: false,
    credentials: '', proxyDetails: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({
          platform: editData.platform || 'META', category: editData.category || 'ad-accounts', profileName: editData.profileName || '',
          country: editData.country || '', countryFlag: editData.countryFlag || '', spendingLimit: editData.spendingLimit?.toString() || '', ageMonths: editData.ageMonths?.toString() || '', price: editData.price?.toString() || '',
          description: editData.description || '', isFeatured: !!editData.isFeatured,
          credentials: editData.hasCredentials ? JSON.stringify(editData.credentials || '') : '', 
          proxyDetails: editData.hasProxy ? editData.proxyDetails || '' : '',
        });
      } else {
        setForm(f => ({ ...f, category: defaultCategory, profileName: '', country: '', countryFlag: '', spendingLimit: '', ageMonths: '', price: '', description: '', isFeatured: false, credentials: '', proxyDetails: '' }));
      }
    }
  }, [isOpen, defaultCategory, editData]);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let parsedCreds = undefined;
      if (form.credentials.trim()) {
        try { parsedCreds = JSON.parse(form.credentials); }
        catch { parsedCreds = { raw: form.credentials }; }
      }
      const data = {
        ...form,
        credentials: parsedCreds,
        spendingLimit: form.spendingLimit ? parseFloat(form.spendingLimit) : undefined,
        ageMonths: form.ageMonths ? parseInt(form.ageMonths) : undefined,
        price: parseFloat(form.price) || 0,
      } as any;
      
      let res;
      if (editData) {
        res = await adminApi.updateAccount(editData.id, data);
      } else {
        res = await adminApi.createAccount(data);
      }
      
      if (res.success) { success(editData ? 'Account updated!' : 'Account created!'); onSuccess(); }
      else error(res.message || 'Failed to save account.');
    } catch { error('Error creating account.'); }
    finally { setLoading(false); }
  };

  const fields = [
    { key: 'profileName', label: 'Profile Name', type: 'text', placeholder: 'US Ad Account Premium' },
    { key: 'platform',    label: 'Platform',     type: 'select', options: ['META','GOOGLE','TIKTOK','BING'] },
    { key: 'category',   label: 'Category',     type: 'select', options: ['ad-accounts','profiles','bm-standard','bm-verified','pages'] },
    { key: 'price',      label: 'Price (USD)',   type: 'number', placeholder: '25' },
    { key: 'country',    label: 'Country Code',  type: 'text',   placeholder: 'US' },
    { key: 'countryFlag',label: 'Flag Emoji',    type: 'text',   placeholder: '🇺🇸' },
    { key: 'spendingLimit', label: 'Spend Limit', type: 'number', placeholder: '50000' },
    { key: 'ageMonths',  label: 'Age (months)',  type: 'number', placeholder: '24' },
    { key: 'description',label: 'Description',   type: 'textarea', placeholder: 'Account description...' },
    { key: 'credentials',label: 'Credentials JSON', type: 'textarea', placeholder: '{"email":"...","password":"..."}' },
    { key: 'proxyDetails',label: 'Proxy Details', type: 'text',  placeholder: 'socks5://user:pass@host:port' },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? "Edit Asset" : "Add New Asset"} subtitle="Encrypted credentials are stored securely." maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[65vh] overflow-y-auto pr-3 custom-scrollbar">
        
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profile Name</label>
          <input type="text" value={form.profileName} onChange={e => set('profileName', e.target.value)} placeholder="US Ad Account Premium" className="w-full bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Platform</label>
            <input type="text" value={form.platform} onChange={e => set('platform', e.target.value)} placeholder="e.g. META" className="w-full bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm uppercase" required />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {['META','GOOGLE','TIKTOK','BING'].map(o => (
                <button type="button" key={o} onClick={() => set('platform', o)} className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border transition-colors uppercase ${form.platform === o ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-card border-border hover:bg-muted/50 dark:hover:bg-muted text-muted-foreground hover:text-foreground'}`}>{o}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. ad-accounts" className="w-full bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm" required />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {['ad-accounts','profiles','bm-standard','bm-verified','pages'].map(o => (
                <button type="button" key={o} onClick={() => set('category', o)} className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border transition-colors ${form.category === o ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-card border-border hover:bg-muted/50 dark:hover:bg-muted text-muted-foreground hover:text-foreground'}`}>{o}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (USD)</label>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25" className="w-full bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm" required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Country</label>
            <div className="flex gap-2">
              <input type="text" value={form.country} onChange={e => set('country', e.target.value)} placeholder="US" className="w-2/3 bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm" required />
              <input type="text" value={form.countryFlag} onChange={e => set('countryFlag', e.target.value)} placeholder="🇺🇸" className="w-1/3 bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm text-center" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Spend Limit</label>
            <input type="number" value={form.spendingLimit} onChange={e => set('spendingLimit', e.target.value)} placeholder="50000" className="w-full bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Age (Months)</label>
            <input type="number" value={form.ageMonths} onChange={e => set('ageMonths', e.target.value)} placeholder="24" className="w-full bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Account description..." rows={2} className="w-full bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all resize-none shadow-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Credentials (JSON)</label>
          <textarea value={form.credentials} onChange={e => set('credentials', e.target.value)} placeholder='{"email":"...","password":"..."}' rows={3} className="w-full font-mono bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-emerald-500 dark:text-emerald-400 placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all resize-none shadow-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Proxy Details</label>
          <input type="text" value={form.proxyDetails} onChange={e => set('proxyDetails', e.target.value)} placeholder="socks5://user:pass@host:port" className="w-full font-mono bg-card border border-border rounded-xl py-2.5 px-3.5 text-xs text-blue-500 dark:text-blue-400 placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 dark:focus:bg-muted/50 transition-all shadow-sm" />
        </div>

        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-muted/50 dark:bg-muted/50 border border-border">
          <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 accent-primary rounded border-border" />
          <label htmlFor="featured" className="text-xs font-bold uppercase tracking-wider text-primary cursor-pointer">Mark as Premium/Featured</label>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-[var(--accent)] to-cyan-600 hover:from-[var(--accent-hover)] hover:to-cyan-500 text-primary-foreground font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow">
          {loading && <div className="w-4 h-4 border-2 border-border/50 border-t-white rounded-full animate-spin" />}
          {editData ? 'Update & Encrypt Asset' : 'Create & Encrypt Asset'}
        </button>
      </form>
    </Modal>
  );
}
