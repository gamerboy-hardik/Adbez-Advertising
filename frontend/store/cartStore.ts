'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, AdAccount } from '@/types';

interface DiscountInfo {
  percentage: number;
  label: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isDrawerOpen: boolean;

  // Actions
  addItem: (account: AdAccount) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;

  // Computed (as selectors)
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscount: () => DiscountInfo;
  getFinalPrice: () => number;
  getAccountIds: () => string[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isDrawerOpen: false,

      addItem: (account: AdAccount) => {
        set((state) => {
          const existing = state.items.find(i => i.id === account.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === account.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, {
              id: account.id,
              name: account.profileName,
              platform: account.platform,
              countryFlag: account.countryFlag,
              price: account.price,
              quantity: 1,
            }],
          };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setCartOpen: (open: boolean) => set({ isOpen: open }),
      setDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscount: (): DiscountInfo => {
        const total = get().getTotalItems();
        if (total >= 10) return { percentage: 10, label: '10% Volume Discount' };
        if (total >= 5)  return { percentage: 5,  label: '5% Volume Discount' };
        return { percentage: 0, label: '' };
      },

      getFinalPrice: () => {
        const total = get().getTotalPrice();
        const { percentage } = get().getDiscount();
        return parseFloat((total * (1 - percentage / 100)).toFixed(2));
      },

      getAccountIds: () => {
        // Returns all account IDs expanded by quantity
        return get().items.flatMap(item =>
          Array(item.quantity).fill(item.id)
        );
      },
    }),
    {
      name: 'adbez-cart',
      // Don't persist UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
