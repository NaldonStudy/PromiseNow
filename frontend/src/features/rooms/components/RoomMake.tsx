import { useState } from 'react';
import CircleBtn from './../../../components/ui/CircleBtn';
import ModalForm from './../../../components/ui/modal/ModalForm';
const RoomMake = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (roomName: string) => {
    // 여기에 실제 room 생성 로직 또는 console.log 등 추가
    console.log('방 이름 제출됨:', roomName);
  };

  return (
    <>
      <ModalForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="약속 이름을 입력해주세요"
        placeholder="ex) 싸피"
        submitText="생성하기"
        onSubmit={handleSubmit}
      />
      <div className="fixed bottom-6 right-6 z-50">
        <CircleBtn iconType="plus" color="primary" iconSize={30} onClick={() => setIsOpen(true)} />
      </div>
    </>
  );
};

export default RoomMake;
