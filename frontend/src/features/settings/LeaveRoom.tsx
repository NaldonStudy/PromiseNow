import { useState } from 'react';
import SquareBtn from './../../components/ui/SquareBtn';
import ModalConfirm from './../../components/ui/modal/ModalConfirm';

const LeaveRoom = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleLeaveRoom = () => {
    //방 나가기 로직 추가하기
    setIsModalOpen(false);
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
        title={`정보가 모두 사라집니다. \n방을 나가시겠습니까?`}
        onConfirm={handleLeaveRoom}
      />
    </>
  );
};

export default LeaveRoom;
