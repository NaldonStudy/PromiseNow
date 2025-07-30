import { useState } from 'react';
import Icon from './../../components/ui/Icon';
import ModalForm from './../../components/ui/modal/ModalForm';

interface Props {
  name: string;
}

const NameEdit = ({ name }: Props) => {
  const [isModal, setIsModal] = useState(false);
  const [userName, setUserName] = useState(name);

  const handleSubmit = (newName: string) => {
    setUserName(newName);
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
