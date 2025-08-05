import SquareBtn from '../../components/ui/SquareBtn';
import ConfirmHeader from './confirmModal/ConfirmHeader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AppointmentEditModal = ({ isOpen, onClose, onConfirm }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white p-6 overflow-y-auto">
      <ConfirmHeader onClose={onClose} />
      {/* 날짜, 시간, 장소 입력 UI가 들어갈 자리 */}
      <div className="mt-6">
        <SquareBtn text="저장하기" template="filled" width="w-full" onClick={onConfirm} />
      </div>
    </div>
  );
};

export default AppointmentEditModal;
