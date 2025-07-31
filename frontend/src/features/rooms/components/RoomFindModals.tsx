import { useEffect, useState } from 'react';
import ModalConfirm from '../../../components/ui/modal/ModalConfirm';

interface Props {
  code: string;
  triggerKey: number;
}

type ModalType = 'confirm' | null;

const RoomFindModals = ({ code, triggerKey }: Props) => {
  const [modalType, setModalType] = useState<ModalType>(null);

  useEffect(() => {
    if (!triggerKey) return;

    if (!code.trim()) {
      alert('참여 코드를 입력해주세요.');
      return;
    }
    if (code !== '1234') {
      alert('해당 코드의 방이 존재하지 않습니다.');
      return;
    }
    setModalType('confirm');
  }, [triggerKey]);

  const handleConfirm = () => {
    setModalType(null);
    // 참여 api 호출
  };

  const handleClose = () => setModalType(null);

  return (
    <>
      {modalType === 'confirm' && (
        <ModalConfirm
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="방에 참여하시겠습니까?"
        />
      )}
    </>
  );
};

export default RoomFindModals;
