import { useJoinedRooms, useJoinRoomByInviteCode } from '../hooks/queries/room';
import { useUserStore } from '../stores/user.store';
import { useCalendarStore } from '../features/calendar/calendar.store';
import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import HomeTemplate from './templates/HomeTemplate';

const HomePage = () => {
  useTitle('내 약속 목록 - PromiseNow');

  const { userId } = useUserStore();
  const { setView, setMode } = useCalendarStore();

  const { data: rooms } = useJoinedRooms(userId!);
  const joinRoomMutation = useJoinRoomByInviteCode(userId!);

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
