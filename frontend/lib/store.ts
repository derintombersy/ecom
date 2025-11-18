import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface CartStore {
  cart: any;
  user: User | null;
  setUser: (user: User | null) => void;
  setCart: (cart: any) => void;
  clearCart: () => void;
}

export const useStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: null,
      user: null,
      setUser: (user) => set({ user }),
      setCart: (cart) => set({ cart }),
      clearCart: () => set({ cart: null }),
    }),
    {
      name: 'ecommerce-storage',
    }
  )
);

