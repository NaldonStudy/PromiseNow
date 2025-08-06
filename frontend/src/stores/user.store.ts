import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  userId: number | null;
  isAuthenticated: boolean;

  setUser: (userId: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: null,
      isAuthenticated: false,

      setUser: (userId) => set({ userId, isAuthenticated: true }),
      logout: () => set({ userId: null, isAuthenticated: false }),
    }),
    {
      name: 'user-store',
    },
  ),
);
