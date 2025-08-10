import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  userId: number;
  isAuthenticated: boolean;

  setUser: (userId: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: -1,
      isAuthenticated: false,

      setUser: (userId) => set({ userId, isAuthenticated: true }),
      logout: () => set({ userId: -1, isAuthenticated: false }),
    }),
    {
      name: 'user-store',
    },
  ),
);
