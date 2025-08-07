import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteRoom } from '../../apis/room/room.api';
import { getUsersInRoom, quitRoom } from '../../apis/room/roomuser.api';
import { useRoomStore } from '../../stores/room.store';
import { useUserStore } from '../../stores/user.store';
import SquareBtn from './../../components/ui/SquareBtn';
import ModalConfirm from './../../components/ui/modal/ModalConfirm';

const LeaveRoom = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentRoomId, setCurrentRoomId } = useRoomStore();
  const { userId } = useUserStore();

  const handleLeaveRoom = async () => {
    if (!currentRoomId || userId === null) {
      alert('방 정보가 없거나 로그인 정보가 없습니다.');
      return;
    }

    try {
      const participants = await getUsersInRoom(currentRoomId);
      const isLastOne = participants!.length === 1;

      if (isLastOne) {
        await deleteRoom(currentRoomId);
      } else {
        await quitRoom({ roomId: currentRoomId, userId });
      }

      setCurrentRoomId(null);

      // ✅ 방 목록 캐시 무효화 → 자동 refetch
      queryClient.invalidateQueries({ queryKey: ['joinedRooms', userId] });

      navigate('/home');
    } catch (error) {
      console.error('방 나가기 또는 삭제 실패:', error);
      alert('방 나가기에 실패했습니다.');
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-center px-20 py-10">
        <SquareBtn
          text="방 나가기"
          template="filled"
          width="w-full"
          textSize="text-md"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <ModalConfirm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`정보가 모두 사라집니다.\n방을 나가시겠습니까?`}
        onConfirm={handleLeaveRoom}
      />
    </>
  );
};

export default LeaveRoom;
