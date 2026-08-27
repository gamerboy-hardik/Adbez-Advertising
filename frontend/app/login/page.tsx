'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Mail, Lock, Shield, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuthStore } from '@/store/authStore';

const LoginCanvas = dynamic(() => import('@/components/three/LoginCanvas').then(m => m.LoginCanvas), {
  ssr: false,
  loading: () => null,
});

/* ── Framer Motion Variants ── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const floatingVariants: Variants = {
  animate: {
    y: [-8, 8, -8],
    rotate: [0, 2, -2, 0],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const }
  }
};

const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      '0 2px 12px rgba(99,102,241,0.15)',
      '0 4px 20px rgba(99,102,241,0.25)',
      '0 2px 12px rgba(99,102,241,0.15)',
    ],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
  }
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { isAuthenticated } = useAuthStore() as any;

  useEffect(() => {
    if (isAuthenticated()) router.push('/');
  }, [isAuthenticated, router]);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setSuccess(true);
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) {
      const msg = err.code === 'auth/user-not-found' ? 'No account found with this email. Switch to Sign Up!'
        : (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials' || err.code === 'auth/wrong-password') 
          ? 'Invalid email or password. (If you have not registered this email yet, click "Sign Up" first!)'
        : err.code === 'auth/email-already-in-use' ? 'Email already registered. Switch to Sign In!'
        : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters.'
        : err.message || 'Authentication failed.';
      setError(msg);
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess(true);
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      if (!success) setLoading(false);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-sm mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
        <motion.div 
          className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-indigo-500 rounded-xl flex items-center justify-center shadow-glow"
          whileHover={{ rotate: 12, scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          {...pulseGlow}
        >
          <Shield size={20} className="text-white" />
        </motion.div>
        <div>
          <p className="text-foreground font-bold text-lg leading-none m-0">AdBez</p>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest m-0">Advertising</p>
        </div>
      </motion.div>

      {/* Mode Switcher Tabs */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 p-1 bg-muted/50 border border-border/50 rounded-2xl mb-6 relative">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); }}
          className={`py-2 rounded-xl text-xs font-bold transition-all relative z-10 ${mode === 'login' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); }}
          className={`py-2 rounded-xl text-xs font-bold transition-all relative z-10 ${mode === 'signup' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Sign Up
        </button>
        <motion.div
          layoutId="activeModeTab"
          className="absolute inset-y-1 w-[calc(50%-4px)] bg-gradient-to-r from-[var(--accent)] to-indigo-500 rounded-xl shadow-glow transition-all"
          style={{ left: mode === 'login' ? '4px' : 'calc(50% + 2px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === 'login' ? 'Sign in to your account to continue.' : 'Register to unlock institutional ad assets & admin matrix.'}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-destructive text-xs p-3.5 rounded-xl flex items-start gap-2.5 overflow-hidden"
          >
            <span className="mt-0.5 text-base leading-none">⚠</span> 
            <div className="flex-1 space-y-2.5">
              <p className="m-0 leading-relaxed font-medium">{error}</p>
              {mode === 'login' && email && (
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError('');
                    try {
                      await createUserWithEmailAndPassword(auth, email, password);
                      setSuccess(true);
                      setTimeout(() => router.push('/'), 800);
                    } catch (err: any) {
                      const msg = err.code === 'auth/email-already-in-use' 
                        ? 'This account already exists! Your password was incorrect. Please use admin2@adbez.com to create a brand new admin account!' 
                        : (err.message || 'Registration failed.');
                      setError(msg);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full py-2 px-3 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all border border-border/50 flex items-center justify-center gap-1.5 cursor-pointer shadow-glow-sm active:scale-95"
                >
                  ⚡ Click here to instantly register "{email}" now!
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 bg-[var(--success-subtle)] border border-[rgba(16,185,129,0.2)] text-success text-xs p-3.5 rounded-xl flex items-center gap-2"
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 0.6 }}>
              <CheckCircle2 size={14} />
            </motion.div>
            Authenticated! Redirecting...
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
          <div className="relative group">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[rgba(var(--accent-rgb),0.5)] focus:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.08)] transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
          <div className="relative group">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type={showPw ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[rgba(var(--accent-rgb),0.5)] focus:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.08)] transition-all duration-300"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="flex items-center justify-end mt-1.5">
            <button type="button" onClick={handleResetPassword} className="text-xs text-[var(--accent)] hover:opacity-80 font-medium transition-colors">
              Forgot Password?
            </button>
          </div>
          
          <AnimatePresence>
            {resetSent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[var(--success-subtle)] border border-[rgba(16,185,129,0.2)] text-success text-xs p-3 rounded-xl flex items-center gap-2 mt-2 overflow-hidden"
              >
                <CheckCircle2 size={14} /> Password reset link sent to your email.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading || success}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(var(--accent-rgb), 0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-[var(--accent)] to-indigo-500 hover:from-[var(--accent-hover)] hover:to-indigo-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : (
            <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={15} /></>
          )}
        </motion.button>
        
      </form>

      <motion.div variants={itemVariants} className="relative mt-6 mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </motion.div>

      <motion.button
        variants={itemVariants}
        onClick={handleGoogleLogin}
        disabled={loading || success}
        whileHover={{ scale: 1.02, borderColor: 'rgba(var(--accent-rgb), 0.3)' }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 bg-background border border-border hover:bg-[var(--bg-card-hover)] disabled:opacity-60 text-foreground font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </motion.button>

      <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-6">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          className="text-[var(--accent)] font-semibold hover:opacity-80 transition-colors"
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </motion.p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] w-full flex bg-background">
      {/* Left: 3D Visual */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-border">
        <LoginCanvas />
        {/* Overlay text */}
        <motion.div 
          className="relative z-10 text-center px-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h2 
            className="text-4xl font-bold text-foreground mb-4 leading-tight"
            {...floatingVariants}
          >
            Institutional-Grade<br />
            <span className="gradient-text">
              Ad Infrastructure
            </span>
          </motion.h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs mx-auto">
            Access the world&apos;s most verified agency ad accounts, business managers, and high-limit profiles.
          </p>
          <motion.div 
            className="flex justify-center gap-8 mt-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } } }}
          >
            {[['2,400+', 'Assets Listed'], ['1,000+', 'Happy Clients'], ['99.2%', 'Success Rate']].map(([val, label]) => (
              <motion.div 
                key={label} 
                className="text-center"
                variants={{ hidden: { opacity: 0, y: 20, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              >
                <p className="text-xl font-bold text-foreground font-mono m-0">{val}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 m-0">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-[480px] shrink-0 flex items-center justify-center p-8 bg-card">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
