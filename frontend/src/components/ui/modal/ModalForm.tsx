import { useState } from 'react';
import Modal from './Modal';
import SquareBtn from '../SquareBtn';
import Input from '../Input';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <p className="font-semibold mb-4">{title}</p>
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
      <div className="flex justify-end gap-2 mt-3">
        <SquareBtn
          text={submitText}
          width="w-full"
          onClick={() => {
            onSubmit(value);
            onClose();
          }}
          template="filled"
        />
      </div>
    </Modal>
  );
};

export default ModalForm;
