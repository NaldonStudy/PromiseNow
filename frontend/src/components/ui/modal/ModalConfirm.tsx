import Modal from './Modal';
import SquareBtn from '../SquareBtn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onConfirm: () => void;
}

const ModalConfirm = ({ isOpen, onClose, title, onConfirm }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <p className="font-semibold mb-4">{title}</p>
      <div className="flex justify-end gap-2">
        <SquareBtn text="확인" onClick={onConfirm} width="w-15" template="filled" />
        <SquareBtn text="취소" onClick={onClose} width="w-15" template="outlined" />
      </div>
    </Modal>
  );
};

export default ModalConfirm;
