import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CircleBtn from '../../../components/ui/CircleBtn';
import ModalForm from '../../../components/ui/modal/ModalForm';

import { useCreateRoom } from '../../../hooks/queries/room';
import { useRoomStore } from '../../../stores/room.store';
import { useRoomUserStore } from '../../../stores/roomUser.store';
import { useUserStore } from '../../../stores/user.store';

type ModalType = 'room' | 'name';

const RoomMake = () => {
  const navigate = useNavigate();
  const { userId } = useUserStore();
  const { setNickname } = useRoomStore();
  const { setRoomUser } = useRoomUserStore();
  const createRoomMutation = useCreateRoom(userId!);

  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('room');
  const [roomTitle, setRoomTitle] = useState('');

  useEffect(() => {
    if (userId === null) {
      alert('로그인이 필요합니다.');
      navigate('/');
    }
  }, [userId, navigate]);

  const handleSubmit = (inputValue: string) => {
    if (modalType === 'room') {
      setRoomTitle(inputValue);
      setModalType('name');
      return;
    }

    if (modalType === 'name') {
      setNickname(inputValue);

      createRoomMutation.mutate(
        {
          roomTitle,
          nickname: inputValue,
          userId: userId!,
        },
        {
          onSuccess: (data) => {
            if (data) {
              // 생성 시 roomUserId 저장
              setRoomUser(data.roomId, data.roomUserId);
              setIsOpen(false);
              navigate(`/${data.roomId}/schedule`);
            } else {
              console.error('방 생성 응답이 null입니다.');
            }
          },
        },
      );
    }
  };

  const modalConfig = {
    room: {
      title: '약속 이름을 입력하세요',
      placeholder: 'ex) 싸피',
      submitText: '확인',
    },
    name: {
      title: '닉네임을 입력하세요',
      placeholder: 'ex) 홍길동',
      submitText: '방 생성하기',
    },
  };

  return (
    <div>
      <ModalForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={modalConfig[modalType].title}
        placeholder={modalConfig[modalType].placeholder}
        submitText={modalConfig[modalType].submitText}
        onSubmit={handleSubmit}
      />

      <div className="fixed bottom-6 right-6 z-50">
        <CircleBtn
          iconType="plus"
          color="primary"
          iconSize={30}
          onClick={() => {
            setModalType('room');
            setIsOpen(true);
          }}
        />
      </div>
    </div>
  );
};

export default RoomMake;
