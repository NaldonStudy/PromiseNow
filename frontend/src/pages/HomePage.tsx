import { useEffect } from 'react';
import { useJoinedRooms, useJoinRoomByInviteCode } from '../hooks/queries/room';
import { useTitle } from '../hooks/common/useTitle';
import { useUserStore } from '../stores/user.store';
import { useCalendarStore } from '../features/calendar/calendar.store';
import { getMyInfo } from '../apis/user/user.api';

import RequireAuth from '../components/RequireAuth';
import HomeTemplate from './templates/HomeTemplate';

const HomePage = () => {
  useTitle('내 약속 목록 - PromiseNow');
  const { user, isAuthenticated, setUser } = useUserStore();
  const { setView, setMode } = useCalendarStore();

  const { data: rooms } = useJoinedRooms(user?.userId || 0);
  const joinRoomMutation = useJoinRoomByInviteCode(user?.userId || 0);

  // 방 입장 시 초기화해야 하는 것들
  const resetRoomState = () => {
    setView('month');
    setMode('view');
  };

  // 인증되지 않았거나 사용자 정보가 없으면 처리
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

  // 참여코드로 참여할 때
  const handleJoinRoom = (
    inviteCode: string,
    nickname: string,
    onSuccess: (roomId: number, roomUserId: number) => void,
  ) => {
    if (!user?.userId) return;
    
    joinRoomMutation.mutate(
      { inviteCode, nickname, userId: user.userId },
      {
        onSuccess: (data) => {
          if (data) {
            onSuccess(data.roomId, data.roomUserId);
          } else {
            alert('참여 실패: 응답이 없습니다.');
          }
        },
        onError: () => {
          alert('코드가 유효하지 않거나 이미 참여한 방입니다.');
        },
      },
    );
    resetRoomState();
  };

  if (!isAuthenticated || !user) {
    return <div>로딩 중...</div>;
  }

  return (
    <RequireAuth>
      <HomeTemplate
        rooms={rooms ?? []}
        onJoinRoom={handleJoinRoom}
        resetRoomState={resetRoomState}
      />
    </RequireAuth>
  );
};

export default HomePage;
