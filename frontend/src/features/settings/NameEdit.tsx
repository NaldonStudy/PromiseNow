import { useState } from 'react';
import { useParams } from 'react-router-dom';

import Icon from '../../components/ui/Icon';
import ModalForm from '../../components/ui/modal/ModalForm';
import { useUpdateNickname } from '../../hooks/queries/room/mutations';
import { useRoomStore } from '../../stores/room.store';
import { useUserStore } from '../../stores/user.store';

interface Props {
  name: string;
  onUpdate: (newName: string) => void;
}

const NameEdit = ({ name, onUpdate }: Props) => {
  const [isModal, setIsModal] = useState(false);
  const [userName, setUserName] = useState(name);

  const { userId } = useUserStore(); // number | null
  const { id } = useParams(); // string | undefined
  const roomId = id ? Number(id) : undefined;

  const { setNickname } = useRoomStore();

  const { mutate: updateNicknameMutate } = useUpdateNickname(userId, roomId);

  const handleSubmit = (newName: string) => {
    if (userId === null) {
      console.warn('userId is null');
      return;
    }

    setUserName(newName);
    onUpdate(newName);
    setIsModal(false);

    updateNicknameMutate(
      { nickname: newName },
      {
        onSuccess: () => {
          setNickname(newName);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{userName}</span>
      <Icon type="edit" size={25} onClick={() => setIsModal(true)} />
      {isModal && (
        <ModalForm
          isOpen={isModal}
          onClose={() => setIsModal(false)}
          title="이름 변경"
          placeholder="이름을 입력하세요"
          submitText="변경하기"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default NameEdit;
