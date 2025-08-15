import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../lib/axiosInstance';
import { hasAuthCookies } from '../lib/cookieUtils';

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
  syncAuthState: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        try {
          // 백엔드 로그아웃 API 호출 (쿠키 삭제 + Redis 토큰 삭제)
          await axiosInstance.get('/auth/logout');
        } catch {
          // 로그아웃 API 실패는 무시 (이미 로그아웃된 상태일 수 있음)
        } finally {
          // 로컬 상태 초기화
          set({ user: null, isAuthenticated: false });
          
          window.location.reload();
        }
      },
      updateUser: (user) => set({ user }),
      
      // 쿠키와 store 상태 동기화
      syncAuthState: () => {
        const { user, isAuthenticated } = get();
        
        // 쿠키가 없는데 store에는 인증 정보가 있는 경우 초기화
        if (!hasAuthCookies() && (isAuthenticated || user)) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'user-store',
    },
  ),
);
