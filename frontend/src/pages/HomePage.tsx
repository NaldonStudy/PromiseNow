import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import HomeTemplate from './templates/HomeTemplate';
import { useJoinedRooms, useJoinRoomByInviteCode } from '../hooks/queries/room';
import { useUserStore } from '../stores/user.store';

const HomePage = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useUserStore();

  const { data: rooms } = useJoinedRooms(userId!);
  const joinRoomMutation = useJoinRoomByInviteCode(userId!);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/');
    }
  }, [isAuthenticated, userId, navigate]);

  const handleJoinRoom = (inviteCode: string, nickname: string, onSuccess: (roomId: number) => void) => {
    joinRoomMutation.mutate(
      { inviteCode, nickname, userId: userId! },
      {
        onSuccess: (data) => {
          if (data) {
            onSuccess(data.roomId);
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
    <HomeTemplate
      rooms={rooms ?? []}
      onJoinRoom={handleJoinRoom}
    />
  );
};

export default HomePage;
