// src/features/settings/components/LeaveRoom.tsx
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteRoom } from '../../../apis/room/room.api';
import { getUsersInRoom, quitRoom } from '../../../apis/room/roomuser.api';
import SquareBtn from '../../../components/ui/SquareBtn';
import ModalConfirm from '../../../components/ui/modal/ModalConfirm';
import { useRoomStore } from '../../../stores/room.store';
import { useUserStore } from '../../../stores/user.store';

const LeaveRoom = () => {
  const [open, setOpen] = useState(false);
  const [willDelete, setWillDelete] = useState(false); // 인원=1이면 quit 후 delete
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { currentRoomId, setCurrentRoomId } = useRoomStore();
  const { userId } = useUserStore();

  // 모달 열 때 현재 인원 확인
  const handleOpen = async () => {
    if (!currentRoomId) return;
    try {
      const users = await getUsersInRoom(currentRoomId); // SimpleInfoResponse[] | null
      const count = users ? users.length : 0;
      setWillDelete(count === 1); // 1명이면 quit+delete, 그 외 quit만
      setOpen(true);
    } catch (e) {
      console.error('참여자 조회 실패', e);
      // 조회 실패 시 기본은 quit만 시도
      setWillDelete(false);
      setOpen(true);
    }
  };

  const handleConfirm = async () => {
    if (!currentRoomId || userId == null) return;

    try {
      if (willDelete) {
        // ✅ 1명일 때: quit → delete 순서로 실행
        await quitRoom(currentRoomId, userId);
        await deleteRoom(currentRoomId);
      } else {
        // ✅ 2명 이상: quit만
        await quitRoom(currentRoomId, userId);
      }

      // 상태/캐시 정리
      setCurrentRoomId(null);
      qc.invalidateQueries({ queryKey: ['joinedRooms', userId] });
      qc.invalidateQueries({ queryKey: ['room', currentRoomId] });

      navigate('/home');
    } catch (e) {
      console.error('방 나가기/삭제 실패', e);
      alert('방 나가기/삭제에 실패했습니다.');
    } finally {
      setOpen(false);
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
          onClick={handleOpen}
        />
      </div>

      <ModalConfirm
        isOpen={open}
        onClose={() => setOpen(false)}
        title={
          willDelete
            ? '현재 방에 1명만 있습니다.\n나가면 방이 삭제됩니다. 진행할까요?'
            : '방을 나가면 방과의 연결 정보가 삭제됩니다. 진행할까요?'
        }
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default LeaveRoom;
