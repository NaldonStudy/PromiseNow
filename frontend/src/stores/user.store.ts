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
          console.log('🔄 로그아웃 시작');
          
          // 백엔드 로그아웃 API 호출 (쿠키 삭제 + Redis 토큰 삭제)
          const response = await axiosInstance.get('/auth/logout');
          console.log('✅ 백엔드 로그아웃 API 호출 성공:', response);
          
        } catch (error) {
          console.error('❌ 로그아웃 API 호출 실패:', error);
        } finally {
          // 로컬 상태 초기화
          set({ user: null, isAuthenticated: false });
          
          // 브라우저 쿠키도 직접 삭제 시도 (추가 보장)
          try {
            // HttpOnly 쿠키는 JavaScript로 직접 삭제할 수 없지만, 
            // 만료 시간을 과거로 설정하여 삭제 시도
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            console.log('✅ 브라우저 쿠키 직접 삭제 완료');
          } catch (cookieError) {
            console.warn('⚠️ 브라우저 쿠키 직접 삭제 실패 (HttpOnly 쿠키는 JavaScript로 삭제 불가):', cookieError);
          }
          
          // 로그인 페이지로 리다이렉트
          console.log('🔄 로그인 페이지로 리다이렉트');
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
