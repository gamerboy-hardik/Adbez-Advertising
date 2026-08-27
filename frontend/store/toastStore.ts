'use client';
import { create } from 'zustand';
import type { Toast, ToastType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ToastStore {
  toasts: Toast[];
  add: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const AUTO_DISMISS_MS = 4000;

export const useToastStore = create<ToastStore>()((set, get) => ({
  toasts: [],

  add: (type, message) => {
    const id = uuidv4();
    set(state => ({ toasts: [...state.toasts, { id, type, message }] }));
    // Auto-dismiss
    setTimeout(() => get().remove(id), AUTO_DISMISS_MS);
  },

  remove: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  success: (message) => get().add('success', message),
  error:   (message) => get().add('error', message),
  info:    (message) => get().add('info', message),
}));
