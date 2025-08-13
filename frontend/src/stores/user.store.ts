import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../lib/axiosInstance';

interface User {
  userId: number;
  email: string;
  username: string;
  joinDate: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        try {
          // 백엔드 로그아웃 API 호출 (쿠키 삭제 + Redis 토큰 삭제)
          await axiosInstance.get('/auth/logout');
        } catch (error) {
          console.error('로그아웃 API 호출 실패:', error);
        } finally {
          // 로컬 상태 초기화
          set({ user: null, isAuthenticated: false });
          // 로그인 페이지로 리다이렉트
          window.location.href = '/';
        }
      },
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'user-store',
    },
  ),
);
