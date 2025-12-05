import { useEffect } from 'react';
import { useUserStore } from '../stores/user.store';
import { getMyInfo } from '../apis/user/user.api';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, setUser } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // 사용자 정보 가져오기 시도 (최대 3번)
      const fetchUserInfo = async (retryCount = 0) => {
        // 쿠키가 설정될 때까지 잠시 대기 (재시도할수록 더 오래)
        await new Promise(resolve => setTimeout(resolve, 100 + retryCount * 200));
        
        try {
          const userInfo = await getMyInfo();
          
          if (userInfo) {
            setUser(userInfo);
          } else {
            // 재시도 가능한 경우 재시도
            if (retryCount < 2) {
              setTimeout(() => fetchUserInfo(retryCount + 1), 500);
            } else {
              window.location.href = '/';
            }
          }
        } catch {
          // 재시도 가능한 경우 재시도
          if (retryCount < 2) {
            setTimeout(() => fetchUserInfo(retryCount + 1), 500);
          } else {
            window.location.href = '/';
          }
        }
      };
      
      fetchUserInfo();
      return;
    }
  }, [isAuthenticated, user, setUser]);

  // 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
