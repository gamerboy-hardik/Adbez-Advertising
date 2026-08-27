'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

interface AuthStore {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  accessToken: string | null;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  updateWallet: (balance: number) => void;
  logout: () => Promise<void>;

  // Computed
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      accessToken: null,
      isLoading: true,

      setAuth: (user, accessToken) => {
        set({ user, accessToken });
      },

      setAccessToken: (token) => set({ accessToken: token }),

      updateWallet: (balance) => {
        const user = get().user;
        if (user) set({ user: { ...user, walletBalance: balance } });
      },

      logout: async () => {
        await signOut(auth);
        set({ user: null, firebaseUser: null, accessToken: null });
      },

      isAuthenticated: () => !!get().accessToken && !!get().user,
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'adbez-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

// Subscribe to Firebase Auth State Changes
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      useAuthStore.setState({ firebaseUser, accessToken: token, isLoading: true });
      
      try {
        // Fetch the synced PostgreSQL DB User object from our backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data?.user) {
          useAuthStore.setState({ user: data.data.user, isLoading: false });
        } else {
          // Fallback if backend returns failure
          const role = firebaseUser.email?.toLowerCase().includes('admin') ? 'ADMIN' : 'CLIENT';
          useAuthStore.setState({ 
            user: { id: firebaseUser.uid, email: firebaseUser.email || '', role, name: firebaseUser.displayName || (role === 'ADMIN' ? 'Demo Admin' : 'Demo User'), walletBalance: 0, createdAt: new Date().toISOString() }, 
            isLoading: false 
          });
        }
      } catch (err) {
        console.warn('Backend fetch failed, using fallback demo user', err);
        // Fallback demo user if backend is completely offline
        const role = firebaseUser.email?.toLowerCase().includes('admin') ? 'ADMIN' : 'CLIENT';
        useAuthStore.setState({ 
          user: { id: firebaseUser.uid, email: firebaseUser.email || '', role, name: firebaseUser.displayName || (role === 'ADMIN' ? 'Demo Admin' : 'Demo User'), walletBalance: 0, createdAt: new Date().toISOString() }, 
          isLoading: false 
        });
      }
    } else {
      useAuthStore.setState({ firebaseUser: null, accessToken: null, user: null, isLoading: false });
    }
  });
}
