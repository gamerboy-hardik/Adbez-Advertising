'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuthStore } from '@/store/authStore';

export default function AdminLoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated, isAdmin } = useAuthStore() as any;

  useEffect(() => {
    // If they are already authenticated and are an admin, push to /admin
    if (isAuthenticated() && isAdmin()) {
      router.push('/admin');
    } else if (isAuthenticated() && !isAdmin()) {
      // If a normal user tries to access this, boot them out
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let the auth store onAuthStateChanged listener handle fetching DB User
      // Note: If they aren't actually an admin in the DB, the useEffect above will bounce them after the DB sync finishes.
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      {/* Darker, more secretive background for admin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm bg-card border border-rose-500/10 rounded-2xl p-8 relative z-10 shadow-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center mb-3 text-rose-500">
            <ShieldAlert size={20} />
          </div>
          <h1 className="font-display text-lg font-bold text-foreground tracking-widest uppercase">
            Restricted Access
          </h1>
          <p className="text-[10px] text-muted-foreground mt-1 text-center font-mono">
            AUTHORIZATION REQUIRED
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Admin Node Email"
                className="w-full bg-muted/50 border border-border rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-rose-500/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Passphrase"
                className="w-full bg-muted/50 border border-border rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-rose-500/40 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : (
              <>
                Initiate Sequence
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
