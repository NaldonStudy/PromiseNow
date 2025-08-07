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
  const [isDeletingRoom, setIsDeletingRoom] = useState(false); // ✅ 삭제 여부 상태
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentRoomId, setCurrentRoomId } = useRoomStore();
  const { userId } = useUserStore();

  // ✅ 모달 열기 전에 참여자 수 확인
  const openModal = async () => {
    if (!currentRoomId) return;

    try {
      const participants = await getUsersInRoom(currentRoomId);

      if (!participants || participants.length === 0) {
        return;
      }

      setIsDeletingRoom(participants.length === 1); // 마지막 1인 → 방 삭제
      setIsModalOpen(true);
    } catch (error) {
      console.error('참여자 조회 실패:', error);
      alert('참여자 정보를 불러올 수 없습니다.');
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoomId || userId === null) {
      alert('방 정보가 없거나 로그인 정보가 없습니다.');
      return;
    }

    try {
      if (isDeletingRoom) {
        await deleteRoom(currentRoomId);
      } else {
        await quitRoom({ roomId: currentRoomId, userId });
      }

      setCurrentRoomId(null);

      // ✅ 방 목록 캐시 무효화
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
          onClick={openModal} // ✅ 참여자 확인 후 모달 오픈
        />
      </div>

      <ModalConfirm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isDeletingRoom
            ? '방 전체가 삭제됩니다.\n정말 나가시겠습니까?'
            : '정보가 모두 사라집니다.\n방을 나가시겠습니까?'
        }
        onConfirm={handleLeaveRoom}
      />
    </>
  );
};

export default LeaveRoom;
