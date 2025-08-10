import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SquareBtn from '../../../components/ui/SquareBtn';
import ModalConfirm from '../../../components/ui/modal/ModalConfirm';

import { getUsersInRoom } from '../../../apis/room/roomuser.api';
import { useDeleteRoom, useQuitRoom } from '../../../hooks/queries/room';
import { useRoomStore } from '../../../stores/room.store';
import { useUserStore } from '../../../stores/user.store';

const LeaveRoom = () => {
  const [open, setOpen] = useState(false);
  const [willDelete, setWillDelete] = useState(false);
  const navigate = useNavigate();

  const { id } = useParams();
  const roomId = Number(id);

  const { setCurrentRoomId } = useRoomStore();
  const { userId } = useUserStore();

  const quitMut = useQuitRoom(roomId, userId!);
  const delMut = useDeleteRoom(roomId, userId!);

  const handleOpen = async () => {
    try {
      const users = await getUsersInRoom(roomId);
      const count = users ? users.length : 0;
      setWillDelete(count === 1);
      setOpen(true);
    } catch (e) {
      console.error('참여자 조회 실패', e);
      setWillDelete(false);
      setOpen(true);
    }
  };

  const handleConfirm = async () => {
    if (userId == null) {
      alert('사용자 정보를 확인할 수 없습니다.');
      return;
    }

    try {
      await quitMut.mutateAsync({ roomId, userId });
      if (willDelete) {
        await delMut.mutateAsync();
      }

      setCurrentRoomId(null);
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
            : '방을 나가면 방 정보가 삭제됩니다. 진행할까요?'
        }
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default LeaveRoom;
