import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import HomeTemplate from './templates/HomeTemplate';
import { useJoinedRooms, useJoinRoomByInviteCode } from '../hooks/queries/room';
import { useUserStore } from '../stores/user.store';
import { useRoomUserStore } from '../stores/roomUser.store'; // ✅ roomUser store import

const HomePage = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useUserStore();
  const { setRoomUser } = useRoomUserStore(); // ✅ roomUser 저장 함수 불러오기

  const { data: rooms } = useJoinedRooms(userId!);
  const joinRoomMutation = useJoinRoomByInviteCode(userId!);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/');
    }
  }, [isAuthenticated, userId, navigate]);

  const handleJoinRoom = (
    inviteCode: string,
    nickname: string,
    onSuccess: (roomId: number) => void
  ) => {
    joinRoomMutation.mutate(
      { inviteCode, nickname, userId: userId! }, // ✅ roomUserId는 request에서 제외
      {
        onSuccess: (data) => {
          if (data) {
            // ✅ 응답에서 받은 roomUserId 저장
            if (data.roomUserId) {
              setRoomUser(data.roomId, data.roomUserId);
            }
            onSuccess(data.roomId);
          } else {
            alert('참여 실패: 응답이 없습니다.');
          }
        },
        onError: () => {
          alert('코드가 유효하지 않거나 이미 참여한 방입니다.');
        },
      }
    );
  };

  if (!isAuthenticated || !userId) {
    return <div>로딩 중...</div>;
  }

  return (
    <HomeTemplate
      rooms={rooms ?? []}
      onJoinRoom={handleJoinRoom}
    />
  );
};

export default HomePage;
