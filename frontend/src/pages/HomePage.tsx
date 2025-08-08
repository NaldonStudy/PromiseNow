import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJoinedRooms, useJoinRoomByInviteCode } from '../hooks/queries/room';
import { useRoomUserStore } from '../stores/roomUser.store';
import { useUserStore } from '../stores/user.store';
import { useCalendarStore } from '../features/calendar/calendar.store';

import HomeTemplate from './templates/HomeTemplate';

const HomePage = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useUserStore();
  const { setRoomUser } = useRoomUserStore();
  const { setView, setMode } = useCalendarStore();

  const { data: rooms } = useJoinedRooms(userId!);
  const joinRoomMutation = useJoinRoomByInviteCode(userId!);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/');
    }
  }, [isAuthenticated, userId, navigate]);

  // 방 입장 시 초기화해야 하는 것들
  const resetRoomState = () => {
    setView('month');
    setMode('view');
  };

  // 참여코드로 참여할 때
  const handleJoinRoom = (
    inviteCode: string,
    nickname: string,
    onSuccess: (roomId: number, roomUserId: number) => void,
  ) => {
    joinRoomMutation.mutate(
      { inviteCode, nickname, userId: userId! },
      {
        onSuccess: (data) => {
          if (data) {
            if (data.roomUserId) {
              setRoomUser(data.roomId, data.roomUserId);
            }
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
  };

  if (!isAuthenticated || !userId) {
    return <div>로딩 중...</div>;
  }

  return (
    <HomeTemplate rooms={rooms ?? []} onJoinRoom={handleJoinRoom} resetRoomState={resetRoomState} />
  );
};

export default HomePage;
