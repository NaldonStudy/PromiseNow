import { useEffect, useState } from 'react';
import Input from '../Input';
import SquareBtn from '../SquareBtn';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placeholder?: string;
  submitText?: string;
  onSubmit: (value: string) => void;
}

const ModalForm = ({
  isOpen,
  onClose,
  title,
  placeholder,
  submitText = '제출',
  onSubmit,
}: Props) => {
  const [value, setValue] = useState('');

  // 모달 열릴 때마다 input 초기화
  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen, title]); // title도 바뀌는 경우 초기화되도록 포함

  const handleSubmit = () => {
    if (!value.trim()) {
      alert('빈 칸을 작성해주세요.');
      return;
    }
    onSubmit(value.trim());
    // onClose는 외부에서 제어 (RoomMakeWithModals 등)
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <p className="font-semibold mb-4">{title}</p>
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
      <div className="flex justify-end gap-2 mt-3">
        <SquareBtn text={submitText} width="w-full" onClick={handleSubmit} template="filled" />
      </div>
    </Modal>
  );
};

export default ModalForm;
