import { useState } from 'react';
import CircleBtn from '../../../components/ui/CircleBtn';
import ModalForm from '../../../components/ui/modal/ModalForm';

type ModalType = 'room' | 'name';

const RoomMakeWithModals = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('room');

  const handleSubmit = (inputValue: string) => {
    // 여기에 실제 room 생성 로직 또는 console.log 등 추가
    if (modalType === 'room') {
      console.log('방 이름 제출됨:', inputValue);
      setModalType('name');
      return;
    }
    if (modalType === 'name') {
      console.log('닉네임 제출됨:', inputValue);
      setIsOpen(false);
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
    <>
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
    </>
  );
};

export default RoomMakeWithModals;
