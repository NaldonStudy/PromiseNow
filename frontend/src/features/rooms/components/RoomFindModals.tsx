import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ModalConfirm from '../../../components/ui/modal/ModalConfirm';
import ModalForm from '../../../components/ui/modal/ModalForm';

interface Props {
  code: string;
  triggerKey: number;
  onJoinRoom: (
    inviteCode: string,
    nickname: string,
    onSuccess: (roomId: number, roomUserId: number) => void,
  ) => void;
}

type ModalType = 'confirm' | 'nickname' | null;

const RoomFindModals = ({ code, triggerKey, onJoinRoom }: Props) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!triggerKey) return;

    if (!code.trim()) {
      alert('참여 코드를 입력해주세요.');
      return;
    }

    setModalType('confirm');
  }, [triggerKey, code]);

  const handleConfirm = () => {
    setModalType('nickname');
  };

  const handleNicknameSubmit = (nickname: string) => {
    onJoinRoom(code, nickname, (roomId) => {
      navigate(`/${roomId}/schedule`);
    });
    setModalType(null);
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

      {modalType === 'nickname' && (
        <ModalForm
          isOpen={true}
          onClose={handleClose}
          title="닉네임을 입력하세요"
          placeholder="ex) 홍길동"
          submitText="참여하기"
          onSubmit={handleNicknameSubmit}
        />
      )}
    </>
  );
};

export default RoomFindModals;
