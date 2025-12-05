import Icon from '../../../components/ui/Icon';

interface ConfirmHeaderProps {
  onClose: () => void;
}

const ConfirmHeader = ({ onClose }: ConfirmHeaderProps) => {
  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-text-dark">
      <span className="font-bold text-lg">약속 일정 정하기</span>
      <Icon type="close" onClick={onClose} />
    </div>
  );
};

export default ConfirmHeader;
