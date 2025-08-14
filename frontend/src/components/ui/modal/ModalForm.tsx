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
  secondBtn?: boolean;
  onSecondBtnClick?: () => void;
  secondBtnText?: string;
}

const ModalForm = ({
  isOpen,
  onClose,
  title,
  placeholder,
  submitText = '제출',
  onSubmit,
  secondBtn = false,
  onSecondBtnClick,
  secondBtnText = '기본 이미지로 변경',
}: Props) => {
  const [value, setValue] = useState('');
  useEffect(() => {
    setValue('');
  }, [title, placeholder]);

  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen, title]);

  const handleSubmit = () => {
    if (!value.trim()) {
      alert('빈 칸을 작성해주세요.');
      return;
    }
    onSubmit(value.trim());
  };
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <p className="font-semibold mb-4">{title}</p>
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
      <div className="flex items-center gap-2 mt-3">
        {secondBtn && onSecondBtnClick && (
          <SquareBtn
            text={secondBtnText}
            width="w-full"
            onClick={onSecondBtnClick}
            template="outlined"
          />
        )}
        <SquareBtn text={submitText} width="w-full" onClick={handleSubmit} template="filled" />
      </div>
    </Modal>
  );
};

export default ModalForm;
