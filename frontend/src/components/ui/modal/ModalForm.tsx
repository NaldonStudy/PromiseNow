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
  useEffect(() => {
    setValue('');
  }, [title, placeholder]);

  const handleSubmit = () => {
    onSubmit(value);
  };

  if (!isOpen) return null;

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
