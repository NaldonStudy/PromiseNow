import Icon from '../../../components/ui/Icon';

interface Props {
  onClose: () => void;
}

const ConfirmHeader = ({ onClose }: Props) => {
  return (
    <div className="flex justify-between px-6 py-4 shadow-md bg-white border-b border-text-dark">
      <span className="font-bold text-lg">약속 일정 정하기</span>
      <div className="text-primary">
        <Icon type="close" onClick={onClose} />
      </div>
    </div>
  );
};

export default ConfirmHeader;
